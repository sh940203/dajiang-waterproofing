import type { MetadataRoute } from "next";
import { getServices } from "@/lib/content/db";

// 正式網址。掛自訂網域後改這裡（robots.ts 也要一起改）再重新 deploy。
const BASE = "https://dajiang-waterproofing.huhu940203.workers.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const routes = ["", "/about", "/services", "/portfolio", "/inquiry", "/contact"];
  const staticEntries = routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
  const serviceEntries = services.map((c) => ({
    url: `${BASE}/services/${c.slug}`,
    lastModified: new Date(),
  }));
  return [...staticEntries, ...serviceEntries];
}
