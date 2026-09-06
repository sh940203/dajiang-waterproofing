import "server-only";
import type { NavNode } from "@/lib/site";
import { getNav, getServices, getSiteSettings } from "./db";

export type Site = {
  name: string;
  nameEn: string;
  tagline: string;
  pitch: string;
  description: string;
  phone: string;
  phoneHref: string;
  lineId: string;
  lineHref: string;
  email: string;
  address: string;
  hours: string;
  serviceArea: string;
};

export type CoreValue = { element: string; label: string; summary: string };

export type ContactReady = {
  phone: boolean;
  line: boolean;
  email: boolean;
  address: boolean;
};

export async function getSite(): Promise<Site> {
  const s = await getSiteSettings();
  return {
    name: s.name ?? "",
    nameEn: s.nameEn ?? "",
    tagline: s.tagline ?? "",
    pitch: s.pitch ?? "",
    description: s.description ?? "",
    phone: s.phone ?? "",
    phoneHref: s.phoneHref ?? "",
    lineId: s.lineId ?? "",
    lineHref: s.lineHref ?? "",
    email: s.email ?? "",
    address: s.address ?? "",
    hours: s.hours ?? "",
    serviceArea: s.serviceArea ?? "",
  };
}

export async function getCoreValues(): Promise<CoreValue[]> {
  const s = await getSiteSettings();
  try {
    const arr = JSON.parse(s.coreValues ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** 哪些聯絡管道已是正式資訊——由值本身推導，未 ready 的前台一律不呈現 */
export function contactReadyFrom(site: Pick<Site, "phone" | "lineId" | "lineHref" | "email" | "address">): ContactReady {
  return {
    phone: Boolean(site.phone),
    line: Boolean(site.lineId && site.lineHref),
    email: Boolean(site.email),
    address: Boolean(site.address),
  };
}

/** 主導覽：上層項目來自 nav_menu_items，「服務項目」的子選單由已發佈服務自動帶入 */
export async function getMainNav(): Promise<NavNode[]> {
  const [navItems, svc] = await Promise.all([getNav(), getServices()]);
  return navItems.map((item) => {
    if (item.href === "/services") {
      return {
        label: item.label,
        href: item.href,
        children: svc.map((s) => ({
          label: s.label,
          href: `/services/${s.slug}`,
          desc: s.short ?? undefined,
        })),
      };
    }
    return { label: item.label, href: item.href };
  });
}
