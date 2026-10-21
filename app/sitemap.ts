import type { MetadataRoute } from "next";
import { getCaseStudies, getServices } from "@/lib/content/db";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, cases] = await Promise.all([getServices(), getCaseStudies()]);
  const routes = ["", "/about", "/services", "/portfolio", "/inquiry", "/contact"];
  const staticEntries = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
  const serviceEntries = services.map((c) => ({
    url: `${SITE_URL}/services/${c.slug}`,
    lastModified: new Date(),
  }));
  const caseEntries = cases.map((c) => ({
    url: `${SITE_URL}/portfolio/${c.slug}`,
    lastModified: c.createdAt ?? new Date(),
  }));
  return [...staticEntries, ...serviceEntries, ...caseEntries];
}
