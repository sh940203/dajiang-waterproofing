import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isEditorAllowed } from "@/lib/admin-nav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "後台", template: "%s｜大江防水後台" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  // editor 不能進 CRM / 工程 / 工班 / 物料 / 使用者 / 網站設定
  if (user.role !== "admin") {
    const pathname = (await headers()).get("x-pathname") ?? "";
    if (pathname && !isEditorAllowed(pathname)) redirect("/admin");
  }

  return (
    <div className="min-h-dvh bg-paper-200 md:flex">
      <AdminSidebar user={user} />
      <div className="flex-1 md:min-w-0">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
