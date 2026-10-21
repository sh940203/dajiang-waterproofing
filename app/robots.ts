import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 後台與私有 API 不需要被爬；/api/media/cases/ 是公開的實績照片，要保留給圖片搜尋
      disallow: ["/admin", "/api/inquiry", "/api/media/leads/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
