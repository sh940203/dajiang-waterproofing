"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { materialSchema, type MaterialInput } from "@/lib/validation/material";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const s = (v?: string) => (v && v.trim() ? v.trim() : null);
const num = (v: unknown) =>
  v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v);

function toRow(d: MaterialInput) {
  return {
    name: d.name.trim(),
    spec: s(d.spec),
    unit: s(d.unit),
    unitPrice: num(d.unitPrice),
    supplier: s(d.supplier),
    stockQty: num(d.stockQty),
  };
}

export async function createMaterial(
  input: MaterialInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = materialSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };
  const [row] = await getDb()
    .insert(materials)
    .values(toRow(p.data))
    .returning({ id: materials.id });
  revalidatePath("/admin/materials");
  return { ok: true, id: row.id };
}

export async function updateMaterial(
  id: string,
  input: MaterialInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = materialSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };
  await getDb().update(materials).set(toRow(p.data)).where(eq(materials.id, id));
  revalidatePath("/admin/materials");
  revalidatePath(`/admin/materials/${id}`);
  return { ok: true, id };
}

export async function deleteMaterial(id: string): Promise<ActionResult> {
  await getAdminOrThrow();
  await getDb().delete(materials).where(eq(materials.id, id));
  revalidatePath("/admin/materials");
  return { ok: true, id };
}
