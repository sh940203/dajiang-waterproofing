import { PageHeader } from "@/components/admin/PageHeader";
import { NewUserForm } from "../NewUserForm";

export const metadata = { title: "新增使用者" };

export default function NewUserPage() {
  return (
    <>
      <PageHeader title="新增使用者" />
      <NewUserForm />
    </>
  );
}
