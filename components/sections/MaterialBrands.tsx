import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteContent } from "@/lib/content/db";
import { CONTENT_DEFAULTS } from "@/lib/content/blocks";

type MaterialsContent = {
  kicker: string;
  title: string;
  intro: string;
  items: { name: string; tagline: string; desc: string; features: string }[];
  whyTitle: string;
  whyParagraphs: string[];
};

export async function MaterialBrands() {
  const content = await getSiteContent("home.materials");
  const c = (content ?? CONTENT_DEFAULTS["home.materials"]) as MaterialsContent;

  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeading kicker={c.kicker} title={c.title} intro={c.intro} />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {c.items.map((item) => (
            <div
              key={item.name}
              className="flex flex-col rounded-2xl border border-border bg-paper-100 p-7"
            >
              <p className="text-xs font-medium tracking-widest text-ink-500">
                {item.tagline}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink-800">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                {item.desc}
              </p>
              <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/85">
                {item.features}
              </p>
            </div>
          ))}
        </div>

        {c.whyParagraphs.length > 0 && (
          <div className="mt-10 border-l-2 border-seal-500 pl-5">
            <h3 className="text-lg font-semibold text-ink-800">{c.whyTitle}</h3>
            <div className="mt-3 max-w-3xl space-y-3 text-base leading-relaxed text-foreground/80">
              {c.whyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
