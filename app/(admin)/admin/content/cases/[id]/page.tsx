import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { caseStudies } from "@/lib/db/schema";
import { getAllServices, getCaseStudyPhotos } from "@/lib/content/db";
import { getMediaBucket, publicUrl } from "@/lib/storage/r2";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CaseForm } from "../CaseForm";
import { CasePhotos } from "../CasePhotos";

export const metadata = { title: "編輯案例" };
export const dynamic = "force-dynamic";

export default async function EditCasePage({
  params,
}: PageProps<"/admin/content/cases/[id]">) {
  const { id } = await params;
  const row = await getDb().query.caseStudies.findFirst({
    where: eq(caseStudies.id, id),
  });
  if (!row) notFound();

  const [services, photos] = await Promise.all([
    getAllServices(),
    getCaseStudyPhotos(id),
  ]);

  const r2Bound = getMediaBucket() != null;

  return (
    <>
      <PageHeader title="編輯案例" description={row.title} />
      <div className="grid gap-6">
        <CaseForm
          initial={row}
          serviceOptions={services.map((s) => ({
            slug: s.slug,
            label: s.label,
          }))}
        />
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-ink-800">
              施工前後照片
            </h2>
            <CasePhotos
              caseId={id}
              r2Bound={r2Bound}
              photos={photos.map((p) => ({
                id: p.id,
                caption: p.caption,
                beforeUrl: p.beforeKey ? publicUrl(p.beforeKey) : null,
                afterUrl: p.afterKey ? publicUrl(p.afterKey) : null,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
