"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getDb } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { getUserOrThrow } from "@/lib/auth";
import { blockDef } from "@/lib/content/blocks";
import { CONTENT_TAGS } from "@/lib/content/db";

export type ActionResult = { ok: true } | { ok: false; error: string };

const str = (v: unknown, max = 4000) => String(v ?? "").slice(0, max);

/** 依區塊定義清洗表單資料，擋掉非預期結構 */
function sanitize(key: string, raw: Record<string, unknown>) {
  const def = blockDef(key);
  if (!def) return null;
  const out: Record<string, unknown> = {};
  for (const f of def.fields) {
    const v = raw[f.name];
    if (f.type === "text" || f.type === "textarea") {
      out[f.name] = str(v);
    } else if (f.type === "stringList") {
      out[f.name] = Array.isArray(v)
        ? v.map((x) => str(x, 600)).filter((x) => x.trim() !== "")
        : [];
    } else {
      // objectList
      out[f.name] = Array.isArray(v)
        ? v.map((item) => {
            const o: Record<string, string> = {};
            for (const sub of f.itemFields) {
              o[sub.name] = str(
                (item as Record<string, unknown>)?.[sub.name],
                600,
              );
            }
            return o;
          })
        : [];
    }
  }
  return out;
}

export async function saveBlock(
  key: string,
  raw: Record<string, unknown>,
): Promise<ActionResult> {
  await getUserOrThrow();
  const clean = sanitize(key, raw);
  if (!clean) return { ok: false, error: "未知的區塊" };

  const db = getDb();
  await db
    .insert(siteContent)
    .values({ sectionKey: key, contentJson: clean })
    .onConflictDoUpdate({
      target: siteContent.sectionKey,
      set: { contentJson: clean, updatedAt: new Date() },
    });

  revalidatePath("/admin/content/pages");
  revalidatePath(`/admin/content/pages/${key}`);
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.siteContent);
  return { ok: true };
}

export async function resetBlock(key: string): Promise<ActionResult> {
  await getUserOrThrow();
  const { CONTENT_DEFAULTS } = await import("@/lib/content/blocks");
  const def = CONTENT_DEFAULTS[key];
  if (!def) return { ok: false, error: "未知的區塊" };
  await getDb()
    .insert(siteContent)
    .values({ sectionKey: key, contentJson: def })
    .onConflictDoUpdate({
      target: siteContent.sectionKey,
      set: { contentJson: def, updatedAt: new Date() },
    });
  revalidatePath(`/admin/content/pages/${key}`);
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.siteContent);
  return { ok: true };
}
