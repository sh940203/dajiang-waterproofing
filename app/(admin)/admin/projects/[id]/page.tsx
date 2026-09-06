import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projectCrews, projectMaterials, projects } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm, type ProjectFormInitial } from "../ProjectForm";
import { loadProjectFormOptions } from "../_data";

export const metadata = { title: "編輯工程" };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const db = getDb();

  const [row, crewLinks, matLinks, opts] = await Promise.all([
    db.query.projects.findFirst({ where: eq(projects.id, id) }),
    db
      .select({ crewId: projectCrews.crewId, role: projectCrews.role })
      .from(projectCrews)
      .where(eq(projectCrews.projectId, id)),
    db
      .select({
        materialId: projectMaterials.materialId,
        quantity: projectMaterials.quantity,
      })
      .from(projectMaterials)
      .where(eq(projectMaterials.projectId, id)),
    loadProjectFormOptions(),
  ]);

  if (!row) notFound();

  const initial: ProjectFormInitial = {
    id: row.id,
    title: row.title,
    customerId: row.customerId,
    address: row.address,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
    notes: row.notes,
    crews: crewLinks,
    materials: matLinks,
  };

  return (
    <>
      <PageHeader title="編輯工程" description={row.title} />
      <ProjectForm
        initial={initial}
        customers={opts.customers}
        crews={opts.crews}
        materials={opts.materials}
      />
    </>
  );
}
