"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildQuery, type SearchParams } from "@/lib/admin/list-params";

export function ListToolbar({
  searchParams,
  placeholder = "搜尋…",
  newHref,
  newLabel = "新增",
  children,
}: {
  searchParams: SearchParams;
  placeholder?: string;
  newHref?: string;
  newLabel?: string;
  /** 額外的篩選控制項 */
  children?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const initialQ = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) ?? "";
  const [q, setQ] = useState(initialQ);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (q === initialQ) return;
      router.push(pathname + buildQuery(searchParams, { q: q || null, page: null }));
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {children}
      {newHref && (
        <Button asChild className="ml-auto">
          <Link href={newHref}>
            <Plus className="size-4" />
            {newLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}
