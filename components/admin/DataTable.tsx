"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { buildQuery, type SearchParams } from "@/lib/admin/list-params";

export type Header = {
  label: string;
  /** 有值 = 可排序，對應 ?sort= */
  sortKey?: string;
  className?: string;
};

export type DataRow = {
  id: string;
  href: string;
  /** 已在 server component 渲染好的每格內容（避免傳 function 過 client 邊界）*/
  cells: ReactNode[];
};

export function DataTable({
  headers,
  rows,
  searchParams,
  sort,
  dir,
  empty = "沒有資料",
}: {
  headers: Header[];
  rows: DataRow[];
  searchParams: SearchParams;
  sort: string | null;
  dir: "asc" | "desc";
  empty?: string;
}) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((h, i) => {
              const active = h.sortKey && h.sortKey === sort;
              const nextDir = active && dir === "asc" ? "desc" : "asc";
              return (
                <TableHead key={i} className={h.className}>
                  {h.sortKey ? (
                    <Link
                      href={buildQuery(searchParams, {
                        sort: h.sortKey,
                        dir: nextDir,
                        page: null,
                      })}
                      className="inline-flex items-center gap-1 hover:text-ink-800"
                    >
                      {h.label}
                      {active ? (
                        dir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </Link>
                  ) : (
                    h.label
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={headers.length}
                className="h-28 text-center text-sm text-dim"
              >
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => router.push(row.href)}
                className="cursor-pointer"
              >
                {row.cells.map((cell, i) => (
                  <TableCell
                    key={i}
                    className={cn("py-3", headers[i]?.className)}
                  >
                    {i === 0 ? (
                      <Link
                        href={row.href}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-ink-800 hover:underline"
                      >
                        {cell}
                      </Link>
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
