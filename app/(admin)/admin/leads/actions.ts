"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { customers, leads, projects, type Lead } from "@/lib/db/schema";
import { getUserOrThrow } from "@/lib/auth";
import { leadNoteSchema, leadStatusSchema } from "@/lib/validation/lead";
import { deleteObjects } from "@/lib/storage/r2";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function revalidateLead(id: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

/** 用詢價內容組一段客戶／工程備註 */
function noteFromLead(lead: Lead): string {
  const bits = [`【官網詢價】${lead.serviceType ?? ""}`.trim()];
  if (lead.preferredTime) bits.push(`方便勘驗時段：${lead.preferredTime}`);
  if (lead.description) bits.push(lead.description);
  return bits.filter(Boolean).join("\n");
}

async function getLead(id: string): Promise<Lead | undefined> {
  return getDb().query.leads.findFirst({ where: eq(leads.id, id) });
}

/* ------------------------------------------------------------------ */
/*  狀態 / 備註                                                        */
/* ------------------------------------------------------------------ */
export async function setLeadStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  await getUserOrThrow();
  const p = leadStatusSchema.safeParse(status);
  if (!p.success) return { ok: false, error: "狀態值不正確" };
  await getDb().update(leads).set({ status: p.data }).where(eq(leads.id, id));
  revalidateLead(id);
  return { ok: true, id };
}

export async function setLeadNote(
  id: string,
  note: string,
): Promise<ActionResult> {
  await getUserOrThrow();
  const p = leadNoteSchema.safeParse(note);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "備註有誤" };
  const value = p.data && p.data.trim() ? p.data.trim() : null;
  await getDb().update(leads).set({ adminNote: value }).where(eq(leads.id, id));
  revalidateLead(id);
  return { ok: true, id };
}

/* ------------------------------------------------------------------ */
/*  轉為客戶 / 工程（帶入詢價資料，不用重打）                          */
/* ------------------------------------------------------------------ */
async function ensureCustomerForLead(lead: Lead): Promise<string> {
  if (lead.customerId) return lead.customerId;
  const [row] = await getDb()
    .insert(customers)
    .values({
      name: lead.name,
      phone: lead.contact,
      address: lead.address ?? null,
      source: "官網詢價",
      notes: noteFromLead(lead),
    })
    .returning({ id: customers.id });
  await getDb()
    .update(leads)
    .set({ customerId: row.id })
    .where(eq(leads.id, lead.id));
  return row.id;
}

export async function convertLeadToCustomer(id: string): Promise<ActionResult> {
  await getUserOrThrow();
  const lead = await getLead(id);
  if (!lead) return { ok: false, error: "找不到此詢價" };
  if (lead.customerId) return { ok: true, id: lead.customerId };

  const customerId = await ensureCustomerForLead(lead);
  revalidateLead(id);
  revalidatePath("/admin/customers");
  return { ok: true, id: customerId };
}

export async function convertLeadToProject(id: string): Promise<ActionResult> {
  await getUserOrThrow();
  const lead = await getLead(id);
  if (!lead) return { ok: false, error: "找不到此詢價" };
  if (lead.projectId) return { ok: true, id: lead.projectId };

  const customerId = await ensureCustomerForLead(lead);

  const titleRaw = [lead.serviceType, lead.address].filter(Boolean).join("｜");
  const title = (titleRaw || `${lead.name} 防水工程`).slice(0, 120);

  const [row] = await getDb()
    .insert(projects)
    .values({
      customerId,
      title,
      address: lead.address ?? null,
      status: "勘驗",
      notes: noteFromLead(lead),
    })
    .returning({ id: projects.id });

  await getDb()
    .update(leads)
    .set({ projectId: row.id, customerId, status: "已排程" })
    .where(eq(leads.id, id));

  revalidateLead(id);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/calendar");
  return { ok: true, id: row.id };
}

/* ------------------------------------------------------------------ */
/*  刪除（連同 R2 附件）                                               */
/* ------------------------------------------------------------------ */
export async function deleteLead(id: string): Promise<ActionResult> {
  await getUserOrThrow();
  const lead = await getLead(id);
  if (lead?.photoKeys?.length) {
    try {
      await deleteObjects(lead.photoKeys);
    } catch (err) {
      console.warn("[leads] 刪除 R2 附件失敗（仍會刪除紀錄）：", err);
    }
  }
  await getDb().delete(leads).where(eq(leads.id, id));
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true, id };
}
