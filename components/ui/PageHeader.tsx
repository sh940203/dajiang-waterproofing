import Link from "next/link";
import { Fragment, type ReactNode } from "react";

type Crumb = { label: string; href?: string };

type Props = {
  title: ReactNode;
  lead?: ReactNode;
  breadcrumbs?: Crumb[];
};

export function PageHeader({ title, lead, breadcrumbs }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-paper-100">
      {/* 淡海浪紋背景 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-ink-100"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          fillOpacity="0.5"
          d="M0,96 C150,140 300,40 450,72 C600,104 750,150 900,120 C1050,90 1150,110 1200,100 L1200,160 L0,160 Z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.35"
          d="M0,120 C200,90 340,150 520,132 C700,114 820,70 1000,96 C1120,113 1170,130 1200,124 L1200,160 L0,160 Z"
        />
      </svg>

      <div className="container-page relative py-14 md:py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="麵包屑" className="mb-4 text-xs text-dim">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-ink-800">
                  首頁
                </Link>
              </li>
              {breadcrumbs.map((c, i) => (
                <Fragment key={i}>
                  <li aria-hidden>／</li>
                  <li>
                    {c.href ? (
                      <Link href={c.href} className="hover:text-ink-800">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-foreground/70">{c.label}</span>
                    )}
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] text-balance">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/80">
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
