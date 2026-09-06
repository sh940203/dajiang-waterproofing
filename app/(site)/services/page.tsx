import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { getServices } from "@/lib/content/db";

export const metadata: Metadata = {
  title: "服務項目",
  description:
    "屋頂防水、外牆防水、浴廁防水、地下室防水、鐵皮屋防水 —— 各類滲漏的工法與施工流程說明。",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        title="服務項目"
        lead="五類最常見的滲漏部位，點入各項目可看到常見徵兆、施工流程與使用工法。"
        breadcrumbs={[{ label: "服務項目" }]}
      />

      <section className="container-page py-16 md:py-24">
        <div className="space-y-4">
          {services.map((c, i) => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}`}
              className="group grid gap-4 rounded-2xl border border-border bg-paper-100 p-6 transition-colors hover:border-ink-300 hover:bg-paper-50 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8"
            >
              <span className="font-serif text-3xl font-bold text-ink-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink-800">
                  {c.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/75">
                  {c.headline}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 group-hover:text-seal-500">
                查看細節
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  <path d="M3 8h9M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
