"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  projectCrews,
  projectMaterials,
  projects,
} from "@/lib/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { projectSchema, type ProjectInput } from "@/lib/validation/project";
import type { DB } from "@/lib/db";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const s = (v?: string | null) => (v && v.trim() ? v.trim() : null);

function scalarRow(d: ProjectInput) {
  return {
    title: d.title.trim(),
    customerId: s(d.customerId),
    address: s(d.address),
    status: d.status,
    startDate: s(d.startDate),
    endDate: s(d.endDate),
    notes: s(d.notes),
  };
}

function dedupe<T>(rows: T[], key: (r: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const k = key(r);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

/** 重新寫入工程的工班／物料關聯（先清後插，無 interactive transaction 需求）*/
async function syncRelations(db: DB, projectId: string, d: ProjectInput) {
  await db.delete(projectCrews).where(eq(projectCrews.projectId, projectId));
  await db
    .delete(projectMaterials)
    .where(eq(projectMaterials.projectId, projectId));

  const crewRows = dedupe(
    d.crews.filter((c) => c.crewId),
    (c) => c.crewId,
  );
  if (crewRows.length) {
    await db.insert(projectCrews).values(
      crewRows.map((c) => ({
        projectId,
        crewId: c.crewId,
        role: s(c.role),
      })),
    );
  }

  const matRows = dedupe(
    d.materials.filter((m) => m.materialId),
    (m) => m.materialId,
  );
  if (matRows.length) {
    await db.insert(projectMaterials).values(
      matRows.map((m) => ({
        projectId,
        materialId: m.materialId,
        quantity: m.quantity && m.quantity !== "" ? Number(m.quantity) : null,
      })),
    );
  }
}

export async function createProject(
  input: ProjectInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = projectSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const db = getDb();
  const [row] = await db
    .insert(projects)
    .values(scalarRow(p.data))
    .returning({ id: projects.id });
  await syncRelations(db, row.id, p.data);

  revalidatePath("/admin/projects");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  return { ok: true, id: row.id };
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = projectSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const db = getDb();
  await db.update(projects).set(scalarRow(p.data)).where(eq(projects.id, id));
  await syncRelations(db, id, p.data);

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  return { ok: true, id };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await getAdminOrThrow();
  const db = getDb();
  await db.delete(projectCrews).where(eq(projectCrews.projectId, id));
  await db.delete(projectMaterials).where(eq(projectMaterials.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));

  revalidatePath("/admin/projects");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  return { ok: true, id };
}
