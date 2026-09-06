import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CONTENT_BLOCKS } from "@/lib/content/blocks";

export const metadata = { title: "頁面文案" };

export default function ContentPagesIndex() {
  return (
    <>
      <PageHeader title="頁面文案" description="首頁與關於頁的文字段落" />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {CONTENT_BLOCKS.map((b) => (
              <li key={b.key}>
                <Link
                  href={`/admin/content/pages/${b.key}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-accent"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-800">{b.label}</p>
                    <p className="mt-0.5 text-xs text-dim">{b.description}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-dim" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
