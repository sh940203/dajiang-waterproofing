"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, desc, eq, gt, lt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { caseStudies, caseStudyPhotos, services } from "@/lib/db/schema";
import { getUserOrThrow } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/db";
import { caseStudySchema, type CaseStudyInput } from "@/lib/validation/case-study";
import {
  checkImage,
  deleteObjects,
  extForType,
  getMediaBucket,
  putObject,
} from "@/lib/storage/r2";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const s = (v?: string) => (v && v.trim() ? v.trim() : null);

async function toRow(d: CaseStudyInput) {
  // categoryLabel 由所選服務帶出
  let categoryLabel: string | null = null;
  if (d.category) {
    const svc = await getDb().query.services.findFirst({
      where: eq(services.slug, d.category),
    });
    categoryLabel = svc?.label ?? d.category;
  }
  return {
    slug: d.slug.trim(),
    title: d.title.trim(),
    category: s(d.category),
    categoryLabel,
    location: s(d.location),
    year: s(d.year),
    summary: s(d.summary),
    beforeNote: s(d.beforeNote),
    afterNote: s(d.afterNote),
    highlights: d.highlights.map((x) => x.trim()).filter(Boolean),
    published: d.published,
  };
}

async function nextSortOrder(): Promise<number> {
  const [row] = await getDb()
    .select({ n: caseStudies.sortOrder })
    .from(caseStudies)
    .orderBy(desc(caseStudies.sortOrder))
    .limit(1);
  return (row?.n ?? -1) + 1;
}

export async function createCase(input: CaseStudyInput): Promise<ActionResult> {
  await getUserOrThrow();
  const p = caseStudySchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const dupe = await getDb().query.caseStudies.findFirst({
    where: eq(caseStudies.slug, p.data.slug.trim()),
  });
  if (dupe) return { ok: false, error: "slug 已存在" };

  const [row] = await getDb()
    .insert(caseStudies)
    .values({ ...(await toRow(p.data)), sortOrder: await nextSortOrder() })
    .returning({ id: caseStudies.id });

  revalidatePath("/admin/content/cases");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.cases);
  return { ok: true, id: row.id };
}

export async function updateCase(
  id: string,
  input: CaseStudyInput,
): Promise<ActionResult> {
  await getUserOrThrow();
  const p = caseStudySchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const dupe = await getDb().query.caseStudies.findFirst({
    where: eq(caseStudies.slug, p.data.slug.trim()),
  });
  if (dupe && dupe.id !== id) return { ok: false, error: "slug 已被其他案例使用" };

  await getDb()
    .update(caseStudies)
    .set(await toRow(p.data))
    .where(eq(caseStudies.id, id));

  revalidatePath("/admin/content/cases");
  revalidatePath(`/admin/content/cases/${id}`);
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.cases);
  return { ok: true, id };
}

export async function deleteCase(id: string): Promise<ActionResult> {
  await getUserOrThrow();
  const db = getDb();
  const photos = await db
    .select()
    .from(caseStudyPhotos)
    .where(eq(caseStudyPhotos.caseStudyId, id));
  const keys = photos.flatMap((p) =>
    [p.beforeKey, p.afterKey].filter((k): k is string => Boolean(k)),
  );
  if (keys.length) {
    try {
      await deleteObjects(keys);
    } catch (err) {
      console.warn("[cases] 刪除 R2 附件失敗（仍會刪除紀錄）：", err);
    }
  }
  await db.delete(caseStudyPhotos).where(eq(caseStudyPhotos.caseStudyId, id));
  await db.delete(caseStudies).where(eq(caseStudies.id, id));

  revalidatePath("/admin/content/cases");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.cases);
  return { ok: true, id };
}

export async function moveCase(
  id: string,
  dir: "up" | "down",
): Promise<ActionResult> {
  await getUserOrThrow();
  const db = getDb();
  const cur = await db.query.caseStudies.findFirst({
    where: eq(caseStudies.id, id),
  });
  if (!cur) return { ok: false, error: "找不到案例" };

  const neighbour = await db.query.caseStudies.findFirst({
    where:
      dir === "up"
        ? lt(caseStudies.sortOrder, cur.sortOrder)
        : gt(caseStudies.sortOrder, cur.sortOrder),
    orderBy:
      dir === "up" ? desc(caseStudies.sortOrder) : asc(caseStudies.sortOrder),
  });
  if (!neighbour) return { ok: true, id };

  await db
    .update(caseStudies)
    .set({ sortOrder: neighbour.sortOrder })
    .where(eq(caseStudies.id, cur.id));
  await db
    .update(caseStudies)
    .set({ sortOrder: cur.sortOrder })
    .where(eq(caseStudies.id, neighbour.id));

  revalidatePath("/admin/content/cases");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.cases);
  return { ok: true, id };
}

/* ---------------- 施工前後照片 ---------------- */
async function uploadOne(
  caseId: string,
  file: File,
  which: "before" | "after",
): Promise<string | null> {
  if (!checkImage(file).ok) return null;
  const key = `cases/${caseId}/${which}-${crypto.randomUUID()}.${extForType(file.type)}`;
  await putObject(key, await file.arrayBuffer(), file.type);
  return key;
}

export async function uploadCasePhoto(
  caseId: string,
  form: FormData,
): Promise<ActionResult> {
  await getUserOrThrow();
  const bucket = getMediaBucket();
  if (!bucket)
    return { ok: false, error: "R2 尚未綁定，無法上傳（部署前需建立 dajiang-media bucket）" };

  const before = form.get("before");
  const after = form.get("after");
  const caption = String(form.get("caption") ?? "").slice(0, 120);

  const beforeFile = before instanceof File && before.size > 0 ? before : null;
  const afterFile = after instanceof File && after.size > 0 ? after : null;
  if (!beforeFile && !afterFile)
    return { ok: false, error: "請至少選一張圖片" };

  const [beforeKey, afterKey] = await Promise.all([
    beforeFile ? uploadOne(caseId, beforeFile, "before") : Promise.resolve(null),
    afterFile ? uploadOne(caseId, afterFile, "after") : Promise.resolve(null),
  ]);
  if (!beforeKey && !afterKey)
    return { ok: false, error: "圖片格式或大小不符（JPG/PNG/WebP，6MB 內）" };

  const db = getDb();
  const existing = await db
    .select({ n: caseStudyPhotos.sortOrder })
    .from(caseStudyPhotos)
    .where(eq(caseStudyPhotos.caseStudyId, caseId))
    .orderBy(desc(caseStudyPhotos.sortOrder))
    .limit(1);

  const [row] = await db
    .insert(caseStudyPhotos)
    .values({
      caseStudyId: caseId,
      beforeKey,
      afterKey,
      caption: caption || null,
      sortOrder: (existing[0]?.n ?? -1) + 1,
    })
    .returning({ id: caseStudyPhotos.id });

  revalidatePath(`/admin/content/cases/${caseId}`);
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.cases);
  return { ok: true, id: row.id };
}

export async function deleteCasePhoto(
  photoId: string,
): Promise<ActionResult> {
  await getUserOrThrow();
  const db = getDb();
  const photo = await db.query.caseStudyPhotos.findFirst({
    where: eq(caseStudyPhotos.id, photoId),
  });
  if (!photo) return { ok: false, error: "找不到照片" };

  const keys = [photo.beforeKey, photo.afterKey].filter(
    (k): k is string => Boolean(k),
  );
  if (keys.length) {
    try {
      await deleteObjects(keys);
    } catch (err) {
      console.warn("[cases] 刪除 R2 物件失敗：", err);
    }
  }
  await db.delete(caseStudyPhotos).where(eq(caseStudyPhotos.id, photoId));

  revalidatePath(`/admin/content/cases/${photo.caseStudyId}`);
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.cases);
  return { ok: true, id: photoId };
}
