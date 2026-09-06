"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, inArray, isNull, not } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { navMenuItems } from "@/lib/db/schema";
import { getUserOrThrow } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/db";

export type ActionResult = { ok: true } | { ok: false; error: string };

const navSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().trim().min(1, "請填名稱").max(20, "字數過長"),
        href: z.string().trim().min(1, "請填連結").max(200, "字數過長"),
      }),
    )
    .max(12),
});

export type NavInput = z.infer<typeof navSchema>;

export async function saveNav(input: NavInput): Promise<ActionResult> {
  await getUserOrThrow();
  const p = navSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const db = getDb();
  const keepIds = p.data.items
    .map((i) => i.id)
    .filter((x): x is string => Boolean(x));

  // 刪除被移除的上層項目（子項目 parentId 另有結構，這裡只動 parentId 為空的）
  await db
    .delete(navMenuItems)
    .where(
      and(
        isNull(navMenuItems.parentId),
        keepIds.length ? not(inArray(navMenuItems.id, keepIds)) : undefined,
      ),
    );

  for (let i = 0; i < p.data.items.length; i++) {
    const it = p.data.items[i];
    if (it.id) {
      await db
        .update(navMenuItems)
        .set({ label: it.label.trim(), href: it.href.trim(), sortOrder: i })
        .where(inArray(navMenuItems.id, [it.id]));
    } else {
      await db.insert(navMenuItems).values({
        label: it.label.trim(),
        href: it.href.trim(),
        sortOrder: i,
      });
    }
  }

  revalidatePath("/admin/content/nav");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.nav);
  return { ok: true };
}
