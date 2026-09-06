import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQuery, type SearchParams } from "@/lib/admin/list-params";
import { cn } from "@/lib/utils";

export function Pagination({
  searchParams,
  page,
  pageSize,
  total,
  basePath,
}: {
  searchParams: SearchParams;
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const link = (p: number) => basePath + buildQuery(searchParams, { page: p });
  const btn =
    "inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 text-sm";

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-dim">
      <span>
        {from}–{to} / 共 {total} 筆
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={link(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={cn(btn, page <= 1 && "pointer-events-none opacity-40")}
        >
          <ChevronLeft className="size-4" />
          上一頁
        </Link>
        <span className="px-1">
          {page} / {pages}
        </span>
        <Link
          href={link(Math.min(pages, page + 1))}
          aria-disabled={page >= pages}
          className={cn(btn, page >= pages && "pointer-events-none opacity-40")}
        >
          下一頁
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
