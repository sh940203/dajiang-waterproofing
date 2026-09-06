"use client";

import { useRouter } from "next/navigation";
import { buildQuery, type SearchParams } from "@/lib/admin/list-params";

export function StatusFilter({
  searchParams,
  basePath,
  options,
  paramKey = "status",
  allLabel = "全部狀態",
}: {
  searchParams: SearchParams;
  basePath: string;
  options: { value: string; label: string }[];
  paramKey?: string;
  allLabel?: string;
}) {
  const router = useRouter();
  const current =
    (Array.isArray(searchParams[paramKey])
      ? (searchParams[paramKey] as string[])[0]
      : (searchParams[paramKey] as string | undefined)) ?? "";

  return (
    <select
      value={current}
      onChange={(e) =>
        router.push(
          basePath +
            buildQuery(searchParams, {
              [paramKey]: e.target.value || null,
              page: null,
            }),
        )
      }
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
