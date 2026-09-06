import { PageHeader } from "@/components/admin/PageHeader";
import { CustomerForm } from "../CustomerForm";

export const metadata = { title: "新增客戶" };

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="新增客戶" />
      <CustomerForm />
    </>
  );
}
