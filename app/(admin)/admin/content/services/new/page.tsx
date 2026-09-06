import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const metadata = { title: "新增服務" };

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="新增服務" />
      <ServiceForm />
    </>
  );
}
