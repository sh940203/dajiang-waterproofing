import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { blockDef, CONTENT_DEFAULTS } from "@/lib/content/blocks";
import { getSiteContent } from "@/lib/content/db";
import { BlockForm } from "../BlockForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/content/pages/[key]">) {
  const { key } = await params;
  return { title: blockDef(key)?.label ?? "頁面文案" };
}

export default async function EditBlockPage({
  params,
}: PageProps<"/admin/content/pages/[key]">) {
  const { key } = await params;
  const def = blockDef(key);
  if (!def) notFound();

  const stored = await getSiteContent(key);
  const initial = stored ?? CONTENT_DEFAULTS[key] ?? {};

  return (
    <>
      <PageHeader
        title={def.label}
        description={def.description}
        actions={
          <Link
            href="/admin/content/pages"
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:underline"
          >
            <ArrowLeft className="size-4" />
            返回
          </Link>
        }
      />
      <BlockForm def={def} initial={initial} />
    </>
  );
}
