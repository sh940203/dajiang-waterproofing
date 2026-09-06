import { PageHeader } from "@/components/admin/PageHeader";
import { getNav } from "@/lib/content/db";
import { NavForm } from "./NavForm";

export const metadata = { title: "導覽選單" };
export const dynamic = "force-dynamic";

export default async function NavPage() {
  const items = await getNav();
  return (
    <>
      <PageHeader title="導覽選單" description="網站頂端的上層選單項目" />
      <NavForm
        initial={items.map((i) => ({
          id: i.id,
          label: i.label,
          href: i.href,
        }))}
      />
    </>
  );
}
