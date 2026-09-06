import Link from "next/link";
import { FileText, LayoutList, Images, Menu, Settings } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "內容管理" };

const sections = [
  {
    href: "/admin/content/settings",
    icon: Settings,
    title: "網站設定",
    desc: "公司名稱、聯絡方式、營業時間、風火水核心價值",
  },
  {
    href: "/admin/content/pages",
    icon: FileText,
    title: "頁面文案",
    desc: "首頁英雄區、品牌段落、關於頁各段落",
  },
  {
    href: "/admin/content/services",
    icon: LayoutList,
    title: "服務項目",
    desc: "五類防水服務的內容、徵兆、流程、排序與上下架",
  },
  {
    href: "/admin/content/cases",
    icon: Images,
    title: "施工實績",
    desc: "案例內容、施工前後照片、排序與上下架",
  },
  {
    href: "/admin/content/nav",
    icon: Menu,
    title: "導覽選單",
    desc: "上層選單項目的名稱、連結與排序",
  },
];

export default function ContentHubPage() {
  return (
    <>
      <PageHeader title="內容管理" description="前台頁面內容與網站設定" />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full transition-colors hover:border-ink-300">
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-700">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-ink-800">{s.title}</p>
                  <p className="mt-1 text-sm text-dim">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
