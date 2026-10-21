import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { CtaBand } from "@/components/sections/CtaBand";
import { getCaseStudies, getCaseStudy, getCaseStudiesWithPhotos } from "@/lib/content/db";
import { publicUrl } from "@/lib/storage/r2";
import { absoluteUrl } from "@/lib/site-url";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const cases = await getCaseStudies();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudy(slug);
  if (!cs || !cs.published) return {};
  const title = [cs.location, cs.title].filter(Boolean).join(" ");
  const description = cs.summary ?? undefined;
  const cover = cs.photos.find((p) => p.afterKey)?.afterKey;
  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: cover
      ? { title, description, images: [absoluteUrl(publicUrl(cover))] }
      : undefined,
  };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudy(slug);
  if (!cs || !cs.published) notFound();

  const subject = [cs.location, cs.title].filter(Boolean).join(" ");
  const others = (await getCaseStudiesWithPhotos({ category: cs.category ?? undefined }))
    .filter((c) => c.slug !== cs.slug)
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title={cs.title}
        lead={cs.summary ?? undefined}
        breadcrumbs={[
          { label: "施工實績", href: "/portfolio" },
          { label: cs.title },
        ]}
      />

      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-paper-100 p-6">
              {cs.category && cs.categoryLabel && (
                <Link
                  href={`/services/${cs.category}`}
                  className="inline-flex w-fit rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-100"
                >
                  {cs.categoryLabel}
                </Link>
              )}
              <dl className="mt-5 space-y-3 text-sm">
                {cs.location && (
                  <div className="flex items-center gap-2">
                    <MapPin aria-hidden size={16} strokeWidth={1.7} className="text-ink-500" />
                    <dt className="sr-only">地點</dt>
                    <dd className="text-foreground/85">{cs.location}</dd>
                  </div>
                )}
                {cs.year && (
                  <div className="flex items-center gap-2">
                    <CalendarDays aria-hidden size={16} strokeWidth={1.7} className="text-ink-500" />
                    <dt className="sr-only">施工年份</dt>
                    <dd className="text-foreground/85">{cs.year}</dd>
                  </div>
                )}
              </dl>
              {(cs.highlights ?? []).length > 0 && (
                <>
                  <h2 className="mt-6 text-sm font-semibold tracking-widest text-ink-500">
                    施工重點
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {(cs.highlights ?? []).map((h) => (
                      <li
                        key={h}
                        className="rounded-full border border-border px-3 py-1 text-xs text-ink-700"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <Link
              href="/inquiry"
              className="block rounded-2xl bg-ink-800 p-6 text-paper-100 transition-colors hover:bg-ink-700"
            >
              <span className="text-base font-semibold">有類似狀況？預約勘驗</span>
              <span className="mt-1 block text-sm text-paper-200/75">
                填表時附上照片，我們更快評估。
              </span>
            </Link>
          </aside>

          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-ink-800">施工前後對比</h2>
            {cs.photos.length > 0 ? (
              cs.photos.map((p) => (
                <BeforeAfter
                  key={p.id}
                  before={p.beforeKey ? publicUrl(p.beforeKey) : undefined}
                  after={p.afterKey ? publicUrl(p.afterKey) : undefined}
                  beforeNote={p.caption ?? undefined}
                  subject={subject}
                />
              ))
            ) : (
              <BeforeAfter subject={subject} />
            )}
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-ink-800">
              更多{cs.categoryLabel ?? ""}實績
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/portfolio/${c.slug}`}
                    className="block h-full rounded-2xl border border-border bg-paper-100 p-5 transition-colors hover:border-ink-300 hover:bg-paper-50"
                  >
                    <h3 className="text-base font-semibold text-ink-800">{c.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-dim">
                      <MapPin aria-hidden size={14} strokeWidth={1.8} />
                      {c.location}・{c.year}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  );
}
