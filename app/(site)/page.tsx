import type { Metadata } from "next";
import { Fragment } from "react";
import { WaveHero, type HeroContent } from "@/components/hero/WaveHero";
import { CoreValues } from "@/components/sections/CoreValues";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { MaterialBrands } from "@/components/sections/MaterialBrands";
import { WhyUs } from "@/components/sections/WhyUs";
import { FeaturedCases } from "@/components/sections/FeaturedCases";
import { CtaBand } from "@/components/sections/CtaBand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteContent } from "@/lib/content/db";
import { CONTENT_DEFAULTS } from "@/lib/content/blocks";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type BrandStoryContent = { kicker: string; title: string; paragraphs: string[] };

export default async function HomePage() {
  const [heroContent, brandStory] = await Promise.all([
    getSiteContent("home.hero"),
    getSiteContent("home.brandStory"),
  ]);
  const hero = (heroContent ?? CONTENT_DEFAULTS["home.hero"]) as HeroContent;
  const brand = (brandStory ??
    CONTENT_DEFAULTS["home.brandStory"]) as BrandStoryContent;
  const brandTitleLines = brand.title.split("\n");

  return (
    <>
      <WaveHero content={hero} />

      <CoreValues />

      {/* 品牌定位 */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <SectionHeading
            kicker={brand.kicker}
            title={brandTitleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          />
          <div className="space-y-4 text-base leading-relaxed text-foreground/80">
            {brand.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <ServicesOverview />
      <MaterialBrands />
      <WhyUs />
      <FeaturedCases />
      <CtaBand />
    </>
  );
}
