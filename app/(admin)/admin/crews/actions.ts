"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { crews } from "@/lib/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { crewSchema, type CrewInput } from "@/lib/validation/crew";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const s = (v?: string) => (v && v.trim() ? v.trim() : null);
function toRow(d: CrewInput) {
  return {
    name: d.name.trim(),
    phone: s(d.phone),
    specialty: s(d.specialty),
    status: d.status,
    notes: s(d.notes),
  };
}

export async function createCrew(input: CrewInput): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = crewSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };
  const [row] = await getDb()
    .insert(crews)
    .values(toRow(p.data))
    .returning({ id: crews.id });
  revalidatePath("/admin/crews");
  return { ok: true, id: row.id };
}

export async function updateCrew(
  id: string,
  input: CrewInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = crewSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };
  await getDb().update(crews).set(toRow(p.data)).where(eq(crews.id, id));
  revalidatePath("/admin/crews");
  revalidatePath(`/admin/crews/${id}`);
  return { ok: true, id };
}

export async function deleteCrew(id: string): Promise<ActionResult> {
  await getAdminOrThrow();
  await getDb().delete(crews).where(eq(crews.id, id));
  revalidatePath("/admin/crews");
  return { ok: true, id };
}
