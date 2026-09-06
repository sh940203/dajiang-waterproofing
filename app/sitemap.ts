import type { MetadataRoute } from "next";
import { getServices } from "@/lib/content/db";

const BASE = "https://dajiang-waterproofing.tw";

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
