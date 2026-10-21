import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServices } from "@/lib/content/db";

const icons: Record<string, React.ReactNode> = {
  roof: (
    <path d="M3 11 12 4l9 7M6 10v9h12v-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "exterior-wall": (
    <path d="M4 4h16v16H4zM4 9h16M4 14h16M11 4v5M15 9v5M9 14v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  ),
  bathroom: (
    <path d="M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM7 12V6a2 2 0 0 1 4 0M18 20l1 1M6 20l-1 1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  basement: (
    <path d="M4 5h16v6a8 8 0 0 1-16 0zM8 5v5M12 5v7M16 5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "metal-roof": (
    <path d="M3 15 8 7l5 8 5-8 3 8M3 15h18M3 19h18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const fallbackIcon = (
  <path d="M12 3 4 9v11h16V9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
);

export async function ServicesOverview() {
  const services = await getServices();

  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        kicker="服務項目"
        title="屋頂與鐵皮屋，我們專門處理"
        intro="從場勘丈量、抓漏修補到完工回報，針對不同屋頂狀況提供對應的防水隔熱方案。"
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((c) => (
          <Link
            key={c.slug}
            href={`/services/${c.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-paper-100 p-6 transition-colors hover:border-ink-300 hover:bg-paper-50"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                {icons[c.slug] ?? fallbackIcon}
              </svg>
            </span>
            <h3 className="mt-5 text-lg font-semibold text-ink-800">{c.label}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/75">
              {c.summary}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink-600 group-hover:text-seal-500">
              了解此項服務
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h9M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
