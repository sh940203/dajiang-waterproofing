import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileCheck, Layers, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema } from "@/lib/seo/schema";
import { getCaseStudiesWithPhotos, getServices, getService } from "@/lib/content/db";
import { publicUrl } from "@/lib/storage/r2";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.label,
    description: (service.intro ?? "").slice(0, 90),
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service || !service.published) notFound();

  const related = (await getCaseStudiesWithPhotos({ category: slug })).slice(0, 2);

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <PageHeader
        title={service.label}
        lead={service.headline ?? undefined}
        breadcrumbs={[
          { label: "服務項目", href: "/services" },
          { label: service.label },
        ]}
      />

      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="space-y-12">
            <p className="text-base leading-relaxed text-foreground/85">
              {service.intro}
            </p>

            <div>
              <h2 className="text-xl font-semibold text-ink-800">常見徵兆</h2>
              <ul className="mt-4 space-y-2.5">
                {(service.symptoms ?? []).map((s) => (
                  <li key={s} className="flex gap-3 text-sm text-foreground/80">
                    <TriangleAlert aria-hidden size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-seal-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink-800">施工流程</h2>
              <ol className="mt-5 space-y-5 border-l border-border pl-6">
                {(service.process ?? []).map((step, i) => (
                  <li key={step.title} className="relative">
                    <span className="absolute -left-[1.65rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-[0.7rem] font-medium text-paper-100 ring-4 ring-background">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-semibold text-ink-800">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                      {step.desc}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-paper-100 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-ink-500">
                <Layers aria-hidden size={18} strokeWidth={1.6} />
                材料與工法
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {service.materials}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-paper-100 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-ink-500">
                <FileCheck aria-hidden size={18} strokeWidth={1.6} />
                保固
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {service.warranty}
              </p>
            </div>
            <Link
              href="/inquiry"
              className="block rounded-2xl bg-ink-800 p-6 text-paper-100 transition-colors hover:bg-ink-700"
            >
              <span className="text-base font-semibold">
                預約這項服務的免費勘驗
              </span>
              <span className="mt-1 block text-sm text-paper-200/75">
                填表時選擇「{service.label}」，附上照片更快評估。
              </span>
            </Link>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-ink-800">相關實績</h2>
            <div className="mt-6 space-y-8">
              {related.map((c) => (
                <article
                  key={c.slug}
                  className="grid gap-6 rounded-2xl border border-border bg-paper-100 p-5 md:grid-cols-[1fr_1.1fr] md:p-7"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-ink-800">
                      <Link href={`/portfolio/${c.slug}`} className="hover:text-seal-500">
                        {c.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-dim">
                      {c.location}・{c.year}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                      {c.summary}
                    </p>
                  </div>
                  <BeforeAfter
                    before={c.photo?.beforeKey ? publicUrl(c.photo.beforeKey) : undefined}
                    after={c.photo?.afterKey ? publicUrl(c.photo.afterKey) : undefined}
                    beforeNote={c.beforeNote ?? undefined}
                    afterNote={c.afterNote ?? undefined}
                    subject={[c.location, c.title].filter(Boolean).join(" ")}
                  />
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  );
}
