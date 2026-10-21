import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSite } from "@/lib/content/settings";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
  preload: false,
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
  preload: false,
});

// 正式網址（OG / canonical / metadataBase 用）。build 期讀不到 Cloudflare secret，
// 且 .env 的 NEXT_PUBLIC_SITE_URL 是本機開發用的 localhost，所以直接寫死正式網址。
// 掛自訂網域後：這裡、app/sitemap.ts、app/robots.ts 三處一起改再重新 deploy。
const SITE_URL = "https://dajiang-waterproofing.huhu940203.workers.dev";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name}｜屋頂・鐵皮屋防水隔熱工程`,
      template: `%s｜${site.name}`,
    },
    description: site.description,
    keywords: [
      "防水工程",
      "抓漏",
      "屋頂防水",
      "鐵皮屋防水",
      "鐵皮屋隔熱",
      "隔熱工程",
      "屋頂隔熱",
      "淨化通風",
      "節能宅",
    ],
    openGraph: {
      title: `${site.name}｜防水工程`,
      description: site.description,
      type: "website",
      locale: "zh_TW",
      siteName: site.name,
      images: [
        {
          url: "/brand/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${site.name}｜屋頂・鐵皮屋防水隔熱工程`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name}｜防水工程`,
      description: site.description,
      images: ["/brand/og-image.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${notoSansTC.variable} ${notoSerifTC.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
