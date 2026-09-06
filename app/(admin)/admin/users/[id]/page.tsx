import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { userRoleLabel } from "@/lib/validation/user";
import { UserControls } from "../UserControls";

export const metadata = { title: "編輯使用者" };
export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const [me, row] = await Promise.all([
    getCurrentUser(),
    getDb().query.adminUsers.findFirst({ where: eq(adminUsers.id, id) }),
  ]);
  if (!row) notFound();

  return (
    <>
      <PageHeader
        title={row.username}
        description={`${userRoleLabel[row.role]}・${row.active ? "啟用中" : "已停用"}`}
        actions={
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:underline"
          >
            <ArrowLeft className="size-4" />
            返回
          </Link>
        }
      />
      <Card className="max-w-lg">
        <CardContent className="p-6">
          <UserControls
            id={row.id}
            role={row.role}
            active={row.active}
            isSelf={row.id === me?.id}
          />
        </CardContent>
      </Card>
    </>
  );
}
