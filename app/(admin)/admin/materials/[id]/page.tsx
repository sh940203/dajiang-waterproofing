import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { MaterialForm } from "../MaterialForm";

export const metadata = { title: "編輯物料" };
export const dynamic = "force-dynamic";

export default async function EditMaterialPage({
  params,
}: PageProps<"/admin/materials/[id]">) {
  const { id } = await params;
  const row = await getDb().query.materials.findFirst({
    where: eq(materials.id, id),
  });
  if (!row) notFound();

  return (
    <>
      <PageHeader title="編輯物料" description={row.name} />
      <MaterialForm initial={row} />
    </>
  );
}
