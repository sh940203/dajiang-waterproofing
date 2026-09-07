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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name}｜屋頂・外牆・浴廁・地下室・鐵皮屋防水工程`,
      template: `%s｜${site.name}`,
    },
    description: site.description,
    keywords: [
      "防水工程",
      "抓漏",
      "屋頂防水",
      "外牆防水",
      "浴室防水",
      "地下室防水",
      "鐵皮屋防水",
      "台中防水",
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
          url: "/brand/great-wave.jpg",
          width: 2200,
          height: 1479,
          alt: `${site.name}｜屋頂・外牆・浴廁・地下室・鐵皮屋防水工程`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name}｜防水工程`,
      description: site.description,
      images: ["/brand/great-wave.jpg"],
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
