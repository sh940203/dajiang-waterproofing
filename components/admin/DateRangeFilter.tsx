"use client";

import { useRouter } from "next/navigation";
import { buildQuery, type SearchParams } from "@/lib/admin/list-params";

/** 兩個日期輸入，寫入 ?from= / ?to=（依 startDate 篩選）*/
export function DateRangeFilter({
  searchParams,
  basePath,
}: {
  searchParams: SearchParams;
  basePath: string;
}) {
  const router = useRouter();
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? "";
  const from = one(searchParams.from);
  const to = one(searchParams.to);

  const push = (patch: Record<string, string | null>) =>
    router.push(
      basePath + buildQuery(searchParams, { ...patch, page: null }),
    );

  const cls =
    "h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

  return (
    <div className="flex items-center gap-1.5 text-sm text-dim">
      <input
        type="date"
        aria-label="開始日期起"
        value={from}
        onChange={(e) => push({ from: e.target.value || null })}
        className={cls}
      />
      <span>–</span>
      <input
        type="date"
        aria-label="開始日期迄"
        value={to}
        onChange={(e) => push({ to: e.target.value || null })}
        className={cls}
      />
    </div>
  );
}
