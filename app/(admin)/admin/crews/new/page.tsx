import { PageHeader } from "@/components/admin/PageHeader";
import { CrewForm } from "../CrewForm";

export const metadata = { title: "新增工班" };

export default function NewCrewPage() {
  return (
    <>
      <PageHeader title="新增工班" />
      <CrewForm />
    </>
  );
}
