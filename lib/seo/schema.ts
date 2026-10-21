import { SITE_URL, absoluteUrl } from "@/lib/site-url";
import type { Site } from "@/lib/content/settings";

/** 全站共用的商家實體 id，其他 schema（Service 等）用它指回同一家公司 */
export const BUSINESS_ID = `${SITE_URL}/#business`;

/** 「+886-958-146-555」格式；電話欄位不是台灣手機格式時就不輸出 */
function intlPhone(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (!/^09\d{8}$/.test(digits)) return undefined;
  return `+886-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
}

/**
 * 屋頂承包商（RoofingContractor ⊂ HomeAndConstructionBusiness ⊂ LocalBusiness）。
 * 刻意不輸出：areaServed / openingHours / address —— 這三項業主尚未確認，
 * 寫錯會讓搜尋引擎與 AI 拿到矛盾的資訊。確認後再補。
 */
export function businessSchema(site: Site, services: { label: string }[]) {
  const sameAs = [site.facebookUrl, site.instagramUrl, site.lineHref].filter(
    Boolean,
  );
  return {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    "@id": BUSINESS_ID,
    name: site.name,
    alternateName: site.nameEn || undefined,
    description: site.description,
    url: SITE_URL,
    logo: absoluteUrl("/brand/logo.jpg"),
    image: absoluteUrl("/brand/og-image.jpg"),
    telephone: intlPhone(site.phone),
    email: site.email || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    knowsAbout: [...services.map((s) => s.label), "屋頂隔熱", "鐵皮屋隔熱", "抓漏"],
  };
}

export function websiteSchema(site: Site) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    url: SITE_URL,
    inLanguage: "zh-Hant-TW",
    publisher: { "@id": BUSINESS_ID },
  };
}

export type Crumb = { label: string; href?: string };

/** 麵包屑：最前面固定是首頁；最後一層（目前頁）沒有 href 時不帶 item，符合 Google 規範 */
export function breadcrumbSchema(crumbs: Crumb[]) {
  const all: Crumb[] = [{ label: "首頁", href: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href ? absoluteUrl(c.href) : undefined,
    })),
  };
}

export function serviceSchema(service: {
  slug: string;
  label: string;
  intro: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/${service.slug}#service`,
    name: service.label,
    serviceType: service.label,
    description: service.intro ?? undefined,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": BUSINESS_ID },
  };
}
