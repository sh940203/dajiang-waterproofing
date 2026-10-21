import type { Metadata } from "next";
import { Camera, FileCheck, Ruler } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconTile } from "@/components/ui/IconTile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaBand } from "@/components/sections/CtaBand";
import { getSiteContent } from "@/lib/content/db";
import { getSite } from "@/lib/content/settings";
import { CONTENT_DEFAULTS } from "@/lib/content/blocks";

type IntroContent = {
  pageLead: string;
  kicker: string;
  title: string;
  paragraphs: string[];
};
type TimelineContent = {
  kicker: string;
  title: string;
  items: { year: string; title: string; desc: string }[];
};
type ValuesContent = {
  kicker: string;
  title: string;
  items: { title: string; desc: string }[];
};

const VALUE_ICONS = [Ruler, Camera, FileCheck];

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: "關於我們",
    description: `${site.name}的施工理念、服務流程與服務範圍。`,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [introRaw, timelineRaw, valuesRaw] = await Promise.all([
    getSiteContent("about.intro"),
    getSiteContent("about.timeline"),
    getSiteContent("about.values"),
  ]);
  const intro = (introRaw ?? CONTENT_DEFAULTS["about.intro"]) as IntroContent;
  const timeline = (timelineRaw ??
    CONTENT_DEFAULTS["about.timeline"]) as TimelineContent;
  const values = (valuesRaw ?? CONTENT_DEFAULTS["about.values"]) as ValuesContent;

  return (
    <>
      <PageHeader
        title="關於大江防水"
        lead={intro.pageLead}
        breadcrumbs={[{ label: "關於我們" }]}
      />

      <section className="container-page py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <SectionHeading kicker={intro.kicker} title={intro.title} />
          <div className="space-y-4 text-base leading-relaxed text-foreground/80">
            {intro.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-100 py-16 md:py-24">
        <div className="container-page">
          <SectionHeading kicker={timeline.kicker} title={timeline.title} />
          <ol className="mt-12 space-y-8 border-l border-border pl-6">
            {timeline.items.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-ink-500 ring-4 ring-paper-100" />
                <p className="text-sm font-medium tracking-widest text-ink-500">
                  {t.year}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-ink-800">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                  {t.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <SectionHeading kicker={values.kicker} title={values.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {values.items.map((v, i) => (
            <div
              key={v.title}
              className="rounded-2xl border border-border bg-paper-100 p-6"
            >
              <IconTile icon={VALUE_ICONS[i % VALUE_ICONS.length]} />
              <h3 className="mt-4 font-serif text-xl font-semibold text-ink-800">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
