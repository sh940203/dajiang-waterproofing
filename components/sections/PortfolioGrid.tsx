"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { cn } from "@/lib/utils";

export type PortfolioCase = {
  slug: string;
  title: string;
  category: string | null;
  categoryLabel: string | null;
  location: string | null;
  year: string | null;
  summary: string | null;
  beforeNote: string | null;
  afterNote: string | null;
  highlights: string[];
  beforeUrl?: string;
  afterUrl?: string;
};

export type PortfolioFilter = { value: string; label: string };

export function PortfolioGrid({
  cases,
  filters,
}: {
  cases: PortfolioCase[];
  filters: PortfolioFilter[];
}) {
  const [active, setActive] = useState<string>("all");

  const list = useMemo(
    () => (active === "all" ? cases : cases.filter((c) => c.category === active)),
    [active, cases],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActive(f.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              active === f.value
                ? "border-ink-800 bg-ink-800 text-paper-100"
                : "border-border text-foreground/70 hover:border-ink-300 hover:text-ink-800",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-dim">共 {list.length} 件</p>

      <div className="mt-6 space-y-8">
        {list.map((c) => (
          <article
            key={c.slug}
            className="grid gap-6 rounded-2xl border border-border bg-paper-100 p-5 md:grid-cols-[1fr_1.1fr] md:p-7"
          >
            <div className="flex flex-col">
              <span className="inline-flex w-fit rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-700">
                {c.categoryLabel}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-ink-800">
                {c.title}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dim">
                {c.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden size={14} strokeWidth={1.8} />
                    {c.location}
                  </span>
                )}
                {c.year && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays aria-hidden size={14} strokeWidth={1.8} />
                    {c.year}
                  </span>
                )}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/75">
                {c.summary}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {c.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full border border-border px-3 py-1 text-xs text-ink-700"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <BeforeAfter
              before={c.beforeUrl}
              after={c.afterUrl}
              beforeNote={c.beforeNote ?? undefined}
              afterNote={c.afterNote ?? undefined}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
