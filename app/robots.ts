import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap:
      "https://dajiang-waterproofing.huhu940203.workers.dev/sitemap.xml",
  };
}
