"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, eq, gt, lt, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { getUserOrThrow } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/db";
import { serviceSchema, type ServiceInput } from "@/lib/validation/service";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const s = (v?: string) => (v && v.trim() ? v.trim() : null);

function toRow(d: ServiceInput) {
  return {
    slug: d.slug.trim(),
    label: d.label.trim(),
    short: s(d.short),
    summary: s(d.summary),
    headline: s(d.headline),
    intro: s(d.intro),
    symptoms: d.symptoms.map((x) => x.trim()).filter(Boolean),
    process: d.process
      .map((p) => ({ title: p.title.trim(), desc: p.desc.trim() }))
      .filter((p) => p.title || p.desc),
    materials: s(d.materials),
    warranty: s(d.warranty),
    published: d.published,
  };
}

async function nextSortOrder(): Promise<number> {
  const [row] = await getDb()
    .select({ n: services.sortOrder })
    .from(services)
    .orderBy(desc(services.sortOrder))
    .limit(1);
  return (row?.n ?? -1) + 1;
}

export async function createService(
  input: ServiceInput,
): Promise<ActionResult> {
  await getUserOrThrow();
  const p = serviceSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const dupe = await getDb().query.services.findFirst({
    where: eq(services.slug, p.data.slug.trim()),
  });
  if (dupe) return { ok: false, error: "slug 已存在" };

  const [row] = await getDb()
    .insert(services)
    .values({ ...toRow(p.data), sortOrder: await nextSortOrder() })
    .returning({ id: services.id });

  revalidatePath("/admin/content/services");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.services);
  return { ok: true, id: row.id };
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<ActionResult> {
  await getUserOrThrow();
  const p = serviceSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const dupe = await getDb().query.services.findFirst({
    where: eq(services.slug, p.data.slug.trim()),
  });
  if (dupe && dupe.id !== id) return { ok: false, error: "slug 已被其他項目使用" };

  await getDb().update(services).set(toRow(p.data)).where(eq(services.id, id));
  revalidatePath("/admin/content/services");
  revalidatePath(`/admin/content/services/${id}`);
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.services);
  return { ok: true, id };
}

export async function deleteService(id: string): Promise<ActionResult> {
  await getUserOrThrow();
  await getDb().delete(services).where(eq(services.id, id));
  revalidatePath("/admin/content/services");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.services);
  return { ok: true, id };
}

/** 與相鄰項目對調 sortOrder */
export async function moveService(
  id: string,
  dir: "up" | "down",
): Promise<ActionResult> {
  await getUserOrThrow();
  const db = getDb();
  const cur = await db.query.services.findFirst({ where: eq(services.id, id) });
  if (!cur) return { ok: false, error: "找不到項目" };

  const neighbour = await db.query.services.findFirst({
    where:
      dir === "up"
        ? lt(services.sortOrder, cur.sortOrder)
        : gt(services.sortOrder, cur.sortOrder),
    orderBy:
      dir === "up" ? desc(services.sortOrder) : asc(services.sortOrder),
  });
  if (!neighbour) return { ok: true, id };

  await db
    .update(services)
    .set({ sortOrder: neighbour.sortOrder })
    .where(eq(services.id, cur.id));
  await db
    .update(services)
    .set({ sortOrder: cur.sortOrder })
    .where(eq(services.id, neighbour.id));

  revalidatePath("/admin/content/services");
  revalidatePath("/", "layout");
  updateTag(CONTENT_TAGS.services);
  return { ok: true, id };
}
