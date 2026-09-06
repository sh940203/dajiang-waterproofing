"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { customerSchema, type CustomerInput } from "@/lib/validation/customer";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const n = (s?: string) => (s && s.trim() ? s.trim() : null);
function toRow(d: CustomerInput) {
  return {
    name: d.name.trim(),
    phone: n(d.phone),
    email: n(d.email),
    address: n(d.address),
    source: n(d.source),
    notes: n(d.notes),
  };
}

export async function createCustomer(
  input: CustomerInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = customerSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };
  const [row] = await getDb()
    .insert(customers)
    .values(toRow(p.data))
    .returning({ id: customers.id });
  revalidatePath("/admin/customers");
  return { ok: true, id: row.id };
}

export async function updateCustomer(
  id: string,
  input: CustomerInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = customerSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };
  await getDb().update(customers).set(toRow(p.data)).where(eq(customers.id, id));
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { ok: true, id };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  await getAdminOrThrow();
  await getDb().delete(customers).where(eq(customers.id, id));
  revalidatePath("/admin/customers");
  return { ok: true, id };
}
