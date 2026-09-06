import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortfolioGrid, type PortfolioFilter } from "@/components/sections/PortfolioGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { getCaseStudiesWithPhotos, getServices } from "@/lib/content/db";
import { publicUrl } from "@/lib/storage/r2";

export const metadata: Metadata = {
  title: "施工實績",
  description:
    "大江防水的屋頂、外牆、浴廁、地下室、鐵皮屋防水施工案例，附施工前後對比與施工重點。",
};

export default async function PortfolioPage() {
  const [cases, services] = await Promise.all([
    getCaseStudiesWithPhotos(),
    getServices(),
  ]);

  const filters: PortfolioFilter[] = [
    { value: "all", label: "全部實績" },
    ...services.map((s) => ({ value: s.slug, label: s.label })),
  ];

  return (
    <>
      <PageHeader
        title="施工實績"
        lead="每一件案例都保留施工前後對比與施工重點。可依防水類型篩選。"
        breadcrumbs={[{ label: "施工實績" }]}
      />

      <section className="container-page py-16 md:py-24">
        <PortfolioGrid
          cases={cases.map((c) => ({
            slug: c.slug,
            title: c.title,
            category: c.category,
            categoryLabel: c.categoryLabel,
            location: c.location,
            year: c.year,
            summary: c.summary,
            beforeNote: c.beforeNote,
            afterNote: c.afterNote,
            highlights: c.highlights ?? [],
            beforeUrl: c.photo?.beforeKey ? publicUrl(c.photo.beforeKey) : undefined,
            afterUrl: c.photo?.afterKey ? publicUrl(c.photo.afterKey) : undefined,
          }))}
          filters={filters}
        />
      </section>

      <CtaBand />
    </>
  );
}
