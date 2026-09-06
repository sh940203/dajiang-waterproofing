import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { publicUrl } from "@/lib/storage/r2";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { leadStatusBadge } from "@/lib/validation/lead";
import {
  LeadConvert,
  LeadDeleteButton,
  LeadNote,
  LeadStatusSelect,
} from "../lead-controls";

export const metadata = { title: "詢價明細" };
export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <dt className="text-sm text-dim">{label}</dt>
      <dd className="text-sm text-foreground/90 whitespace-pre-wrap">
        {children}
      </dd>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const lead = await getDb().query.leads.findFirst({ where: eq(leads.id, id) });
  if (!lead) notFound();

  const photos = (lead.photoKeys ?? []).map((key) => ({
    key,
    url: publicUrl(key),
  }));

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {lead.name}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-normal ${leadStatusBadge[lead.status]}`}
            >
              {lead.status}
            </span>
          </span>
        }
        description={`收到於 ${lead.createdAt.toLocaleString("zh-TW")}`}
        actions={
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:underline"
          >
            <ArrowLeft className="size-4" />
            回收件匣
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* 詢價內容 */}
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <dl className="divide-y divide-border">
                <Row label="聯絡方式">{lead.contact}</Row>
                <Row label="施工地點">{lead.address ?? "—"}</Row>
                <Row label="防水類型">{lead.serviceType ?? "—"}</Row>
                <Row label="方便時段">{lead.preferredTime ?? "—"}</Row>
                <Row label="滲漏描述">{lead.description ?? "—"}</Row>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">
                現場照片
                <span className="ml-1.5 font-normal text-dim">
                  {photos.length}
                </span>
              </h2>
              {photos.length === 0 ? (
                <p className="text-sm text-dim">此筆詢價沒有附照片</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((p) => (
                    <a
                      key={p.key}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-lg border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt="現場照片"
                        className="aspect-square w-full object-cover transition-opacity hover:opacity-90"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">
                後台備註
              </h2>
              <LeadNote id={lead.id} initial={lead.adminNote ?? ""} />
            </CardContent>
          </Card>
        </div>

        {/* 操作 */}
        <div className="grid content-start gap-6">
          <Card>
            <CardContent className="grid gap-4 p-5">
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-ink-800">狀態</span>
                <LeadStatusSelect id={lead.id} value={lead.status} />
              </div>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-ink-800">
                  轉為 CRM 紀錄
                </span>
                <p className="text-xs text-dim">
                  會帶入姓名、聯絡方式、地點與描述，不用重打。
                </p>
                <LeadConvert
                  id={lead.id}
                  customerId={lead.customerId}
                  projectId={lead.projectId}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <LeadDeleteButton id={lead.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
