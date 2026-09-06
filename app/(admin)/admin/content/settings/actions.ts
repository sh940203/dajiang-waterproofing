"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/db";
import { settingsSchema, type SettingsInput } from "@/lib/validation/settings";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = settingsSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const db = getDb();
  const entries: [string, string][] = Object.entries(p.data.values).map(
    ([k, v]) => [k, v.trim()],
  );
  entries.push(["coreValues", JSON.stringify(p.data.coreValues)]);

  for (const [key, value] of entries) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value } });
  }

  revalidatePath("/admin/content/settings");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.settings);
  return { ok: true };
}
