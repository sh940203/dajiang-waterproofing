import { PageHeader } from "@/components/admin/PageHeader";
import { getAllServices } from "@/lib/content/db";
import { CaseForm } from "../CaseForm";

export const metadata = { title: "新增案例" };
export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  const services = await getAllServices();
  return (
    <>
      <PageHeader title="新增案例" />
      <CaseForm
        serviceOptions={services.map((s) => ({ slug: s.slug, label: s.label }))}
      />
    </>
  );
}
