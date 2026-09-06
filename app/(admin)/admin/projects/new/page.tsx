import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "../ProjectForm";
import { loadProjectFormOptions } from "../_data";

export const metadata = { title: "新增工程" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const opts = await loadProjectFormOptions();
  return (
    <>
      <PageHeader title="新增工程" description="建立工程並可即時指派工班、登錄物料" />
      <ProjectForm
        customers={opts.customers}
        crews={opts.crews}
        materials={opts.materials}
      />
    </>
  );
}
