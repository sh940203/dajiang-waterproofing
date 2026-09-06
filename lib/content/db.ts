import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  caseStudies,
  caseStudyPhotos,
  navMenuItems,
  services,
  siteContent,
  siteSettings,
  type CaseStudyPhoto,
} from "@/lib/db/schema";

/**
 * 前台內容的資料存取層（B5 切換後正式生效）。所有讀取都經 `unstable_cache`
 * 快取（Next Data Cache），CMS 的 server actions 寫入後呼叫對應的
 * `revalidateTag()` 觸發下一次請求重新產生 —— 效果等同 ISR。
 */
export const CONTENT_TAGS = {
  services: "content:services",
  cases: "content:cases",
  nav: "content:nav",
  settings: "content:settings",
  siteContent: "content:pages",
} as const;

/* ---------------- 服務項目 ---------------- */
export const getServices = unstable_cache(
  async () =>
    getDb()
      .select()
      .from(services)
      .where(eq(services.published, true))
      .orderBy(asc(services.sortOrder)),
  ["services-published"],
  { tags: [CONTENT_TAGS.services] },
);

export async function getAllServices() {
  return getDb().select().from(services).orderBy(asc(services.sortOrder));
}

export async function getService(slug: string) {
  return unstable_cache(
    async () =>
      getDb().query.services.findFirst({ where: eq(services.slug, slug) }),
    ["service", slug],
    { tags: [CONTENT_TAGS.services] },
  )();
}

/* ---------------- 施工實績 ---------------- */
export async function getCaseStudies(opts?: { category?: string }) {
  return unstable_cache(
    async () =>
      getDb()
        .select()
        .from(caseStudies)
        .where(
          opts?.category
            ? and(
                eq(caseStudies.published, true),
                eq(caseStudies.category, opts.category),
              )
            : eq(caseStudies.published, true),
        )
        .orderBy(asc(caseStudies.sortOrder)),
    ["case-studies", opts?.category ?? "all"],
    { tags: [CONTENT_TAGS.cases] },
  )();
}

/** 案例清單 + 各自第一組施工前後照片（卡片顯示用） */
export async function getCaseStudiesWithPhotos(opts?: { category?: string }) {
  const list = await getCaseStudies(opts);
  if (list.length === 0) return [];
  const ids = list.map((c) => c.id);
  const photos = await unstable_cache(
    async () =>
      getDb()
        .select()
        .from(caseStudyPhotos)
        .where(inArray(caseStudyPhotos.caseStudyId, ids))
        .orderBy(asc(caseStudyPhotos.sortOrder)),
    ["case-study-photos", ids.join(",")],
    { tags: [CONTENT_TAGS.cases] },
  )();

  const firstByCase = new Map<string, CaseStudyPhoto>();
  for (const p of photos) {
    if (!firstByCase.has(p.caseStudyId)) firstByCase.set(p.caseStudyId, p);
  }
  return list.map((c) => ({ ...c, photo: firstByCase.get(c.id) ?? null }));
}

export async function getAllCaseStudies() {
  return getDb()
    .select()
    .from(caseStudies)
    .orderBy(asc(caseStudies.sortOrder));
}

export async function getCaseStudy(slug: string) {
  return unstable_cache(
    async () => {
      const cs = await getDb().query.caseStudies.findFirst({
        where: eq(caseStudies.slug, slug),
      });
      if (!cs) return null;
      const photos = await getDb()
        .select()
        .from(caseStudyPhotos)
        .where(eq(caseStudyPhotos.caseStudyId, cs.id))
        .orderBy(asc(caseStudyPhotos.sortOrder));
      return { ...cs, photos };
    },
    ["case-study", slug],
    { tags: [CONTENT_TAGS.cases] },
  )();
}

export async function getCaseStudyPhotos(caseStudyId: string) {
  return getDb()
    .select()
    .from(caseStudyPhotos)
    .where(eq(caseStudyPhotos.caseStudyId, caseStudyId))
    .orderBy(asc(caseStudyPhotos.sortOrder));
}

/* ---------------- 導覽 ---------------- */
export const getNav = unstable_cache(
  async () =>
    getDb()
      .select()
      .from(navMenuItems)
      .where(isNull(navMenuItems.parentId))
      .orderBy(asc(navMenuItems.sortOrder)),
  ["nav-top-level"],
  { tags: [CONTENT_TAGS.nav] },
);

/* ---------------- 網站設定 ---------------- */
export const getSiteSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await getDb().select().from(siteSettings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  },
  ["site-settings"],
  { tags: [CONTENT_TAGS.settings] },
);

/* ---------------- 頁面文案區塊 ---------------- */
export async function getSiteContent(
  key: string,
): Promise<Record<string, unknown> | null> {
  return unstable_cache(
    async () => {
      const row = await getDb().query.siteContent.findFirst({
        where: eq(siteContent.sectionKey, key),
      });
      return (row?.contentJson as Record<string, unknown>) ?? null;
    },
    ["site-content", key],
    { tags: [CONTENT_TAGS.siteContent] },
  )();
}

export async function getAllSiteContent(): Promise<
  Record<string, Record<string, unknown>>
> {
  const rows = await getDb().select().from(siteContent);
  return Object.fromEntries(
    rows.map((r) => [r.sectionKey, r.contentJson as Record<string, unknown>]),
  );
}
