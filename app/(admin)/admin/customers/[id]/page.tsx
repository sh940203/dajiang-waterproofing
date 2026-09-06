import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { CustomerForm } from "../CustomerForm";

export const metadata = { title: "編輯客戶" };
export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const row = await getDb().query.customers.findFirst({
    where: eq(customers.id, id),
  });
  if (!row) notFound();

  return (
    <>
      <PageHeader title="編輯客戶" description={row.name} />
      <CustomerForm initial={row} />
    </>
  );
}
