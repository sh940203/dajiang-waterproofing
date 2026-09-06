import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { getCaseStudiesWithPhotos } from "@/lib/content/db";
import { publicUrl } from "@/lib/storage/r2";

export async function FeaturedCases() {
  const all = await getCaseStudiesWithPhotos();
  const featured = all.slice(0, 3);

  return (
    <section className="container-page py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          kicker="施工實績"
          title="施工前後，並排看得見"
          intro="每一件案例都保留施工前後對比與施工重點，作為評估的參考。"
        />
        <Link
          href="/portfolio"
          className="rounded-full border border-ink-800/25 px-5 py-2.5 text-sm font-medium text-ink-800 transition-colors hover:border-ink-800 hover:bg-ink-50"
        >
          全部實績
        </Link>
      </div>

      <div className="mt-12 space-y-10">
        {featured.map((c) => (
          <article
            key={c.slug}
            className="grid gap-6 rounded-2xl border border-border bg-paper-100 p-5 md:grid-cols-[1fr_1.1fr] md:p-7"
          >
            <div className="flex flex-col">
              <span className="inline-flex w-fit rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-700">
                {c.categoryLabel}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-ink-800">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-dim">
                {c.location}・{c.year}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/75">
                {c.summary}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(c.highlights ?? []).map((h) => (
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
              before={c.photo?.beforeKey ? publicUrl(c.photo.beforeKey) : undefined}
              after={c.photo?.afterKey ? publicUrl(c.photo.afterKey) : undefined}
              beforeNote={c.beforeNote ?? undefined}
              afterNote={c.afterNote ?? undefined}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
