import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const metadata = { title: "編輯服務" };
export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: PageProps<"/admin/content/services/[id]">) {
  const { id } = await params;
  const row = await getDb().query.services.findFirst({
    where: eq(services.id, id),
  });
  if (!row) notFound();

  return (
    <>
      <PageHeader title="編輯服務" description={row.label} />
      <ServiceForm initial={row} />
    </>
  );
}
