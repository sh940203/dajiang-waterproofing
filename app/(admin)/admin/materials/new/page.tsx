import { PageHeader } from "@/components/admin/PageHeader";
import { MaterialForm } from "../MaterialForm";

export const metadata = { title: "新增物料" };

export default function NewMaterialPage() {
  return (
    <>
      <PageHeader title="新增物料" />
      <MaterialForm />
    </>
  );
}
