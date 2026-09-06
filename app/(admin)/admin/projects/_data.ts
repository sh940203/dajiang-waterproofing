import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { crews, customers, materials } from "@/lib/db/schema";

/** 工程表單用的下拉選項（客戶／工班／物料）*/
export async function loadProjectFormOptions() {
  const db = getDb();
  const [cs, cr, ms] = await Promise.all([
    db
      .select({ id: customers.id, name: customers.name, phone: customers.phone })
      .from(customers)
      .orderBy(asc(customers.name)),
    db
      .select({ id: crews.id, name: crews.name, specialty: crews.specialty })
      .from(crews)
      .orderBy(asc(crews.name)),
    db
      .select({ id: materials.id, name: materials.name, spec: materials.spec })
      .from(materials)
      .orderBy(asc(materials.name)),
  ]);
  return {
    customers: cs.map((c) => ({
      id: c.id,
      name: c.name,
      hint: c.phone ?? undefined,
    })),
    crews: cr.map((c) => ({
      id: c.id,
      name: c.name,
      hint: c.specialty ?? undefined,
    })),
    materials: ms.map((m) => ({
      id: m.id,
      name: m.name,
      hint: m.spec ?? undefined,
    })),
  };
}
