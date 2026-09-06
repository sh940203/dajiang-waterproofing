import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { crews } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { CrewForm } from "../CrewForm";

export const metadata = { title: "編輯工班" };
export const dynamic = "force-dynamic";

export default async function EditCrewPage({
  params,
}: PageProps<"/admin/crews/[id]">) {
  const { id } = await params;
  const row = await getDb().query.crews.findFirst({ where: eq(crews.id, id) });
  if (!row) notFound();

  return (
    <>
      <PageHeader title="編輯工班" description={row.name} />
      <CrewForm initial={row} />
    </>
  );
}
