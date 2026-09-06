import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllServices } from "@/lib/content/db";
import { ReorderRow } from "./ReorderRow";

export const metadata = { title: "服務項目" };
export const dynamic = "force-dynamic";

export default async function ServicesContentPage() {
  const rows = await getAllServices();

  return (
    <>
      <PageHeader
        title="服務項目"
        description="上下箭頭調整前台排序"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/content/services/new">新增服務</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-dim">
              還沒有服務項目
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <ReorderRow
                    id={r.id}
                    isFirst={i === 0}
                    isLast={i === rows.length - 1}
                  />
                  <Link
                    href={`/admin/content/services/${r.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-medium text-ink-800">
                      {r.label}
                      <span className="ml-2 font-normal text-dim">
                        /{r.slug}
                      </span>
                    </p>
                    <p className="truncate text-xs text-dim">
                      {r.summary ?? r.short ?? "—"}
                    </p>
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      r.published
                        ? "bg-ink-50 text-ink-700"
                        : "bg-paper-400/60 text-dim"
                    }`}
                  >
                    {r.published ? "已發佈" : "草稿"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
