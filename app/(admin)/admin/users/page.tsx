import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userRoleLabel } from "@/lib/validation/user";

export const metadata = { title: "使用者" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await getCurrentUser();
  const rows = await getDb()
    .select()
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));

  return (
    <>
      <PageHeader
        title="使用者"
        description="後台帳號與權限。editor 只能編輯內容與處理詢價。"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/users/new">新增使用者</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {rows.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/admin/users/${u.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">
                      {u.username}
                      {u.id === me?.id && (
                        <span className="ml-2 text-xs font-normal text-dim">
                          （你）
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-dim">
                      建立於 {u.createdAt.toLocaleDateString("zh-TW")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-ink-50 px-2 py-0.5 text-xs text-ink-700">
                      {userRoleLabel[u.role]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        u.active
                          ? "bg-ink-100 text-ink-800"
                          : "bg-paper-400/60 text-dim"
                      }`}
                    >
                      {u.active ? "啟用中" : "已停用"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
