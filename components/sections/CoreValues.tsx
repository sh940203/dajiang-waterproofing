import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteContent } from "@/lib/content/db";
import { getCoreValues } from "@/lib/content/settings";
import { CONTENT_DEFAULTS } from "@/lib/content/blocks";

type HeroCoreValuesContent = {
  kicker: string;
  title: string;
  intro: string;
  footnote: string;
};

export async function CoreValues() {
  const [content, coreValues] = await Promise.all([
    getSiteContent("home.coreValues"),
    getCoreValues(),
  ]);
  const c = (content ??
    CONTENT_DEFAULTS["home.coreValues"]) as HeroCoreValuesContent;

  return (
    <section className="bg-paper-100 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading kicker={c.kicker} title={c.title} intro={c.intro} />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {coreValues.map((core) => (
            <div
              key={core.element}
              className="flex flex-col rounded-2xl border border-border bg-paper-50 p-7"
            >
              <span
                aria-hidden
                className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-800 font-serif text-2xl font-bold text-paper-100"
              >
                {core.element}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink-800">
                {core.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                {core.summary}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 border-l-2 border-seal-500 pl-4 text-base text-foreground/80">
          {c.footnote}
        </p>
      </div>
    </section>
  );
}
