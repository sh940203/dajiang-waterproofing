/**
 * 初始化 / 補灌後台資料庫。
 *
 *   npm run db:seed
 *
 * - 建立第一個後台管理員（SEED_ADMIN_USER / SEED_ADMIN_PASSWORD，已存在則略過）
 * - 把目前寫死在 lib/ 的內容灌進 services / case_studies / nav_menu_items / site_settings
 *   （以 slug / key upsert，可重複執行來刷新內容）
 *
 * B5 前台切換資料庫「之前」先跑這支，內容才會一致。
 */
import "dotenv/config";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { argon2id } from "hash-wasm";

import * as schema from "../lib/db/schema";
import { serviceCategories, site, coreValues } from "../lib/site";
import { serviceDetails } from "../lib/content/services";
import { caseStudies } from "../lib/content/portfolio";
import { CONTENT_DEFAULTS } from "../lib/content/blocks";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("缺少 TURSO_DATABASE_URL（放在 .env）");
  process.exit(1);
}
const db = drizzle(
  createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
  { schema },
);

async function hashPassword(pw: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return argon2id({
    password: pw,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 19456, // ~19 MiB
    hashLength: 32,
    outputType: "encoded",
  });
}

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USER;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) {
    console.log("· 略過管理員（未設 SEED_ADMIN_USER / SEED_ADMIN_PASSWORD）");
    return;
  }
  const existing = await db.query.adminUsers.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });
  if (existing) {
    console.log(`· 管理員「${username}」已存在，略過`);
    return;
  }
  await db.insert(schema.adminUsers).values({
    username,
    passwordHash: await hashPassword(password),
    role: "admin",
  });
  console.log(`✓ 建立管理員「${username}」(role: admin)`);
}

async function seedServices() {
  let n = 0;
  for (let i = 0; i < serviceCategories.length; i++) {
    const c = serviceCategories[i];
    const d = serviceDetails[c.slug];
    await db
      .insert(schema.services)
      .values({
        slug: c.slug,
        label: c.label,
        short: c.short,
        summary: c.summary,
        headline: d.headline,
        intro: d.intro,
        symptoms: [...d.symptoms],
        process: d.process.map((p) => ({ title: p.title, desc: p.desc })),
        materials: d.materials,
        warranty: d.warranty,
        sortOrder: i,
        published: true,
      })
      .onConflictDoUpdate({
        target: schema.services.slug,
        set: {
          label: c.label,
          short: c.short,
          summary: c.summary,
          headline: d.headline,
          intro: d.intro,
          symptoms: [...d.symptoms],
          process: d.process.map((p) => ({ title: p.title, desc: p.desc })),
          materials: d.materials,
          warranty: d.warranty,
          sortOrder: i,
        },
      });
    n++;
  }
  console.log(`✓ services: ${n} 筆`);
}

async function seedCaseStudies() {
  let n = 0;
  for (let i = 0; i < caseStudies.length; i++) {
    const c = caseStudies[i];
    await db
      .insert(schema.caseStudies)
      .values({
        slug: c.slug,
        title: c.title,
        category: c.category,
        categoryLabel: c.categoryLabel,
        location: c.location,
        year: c.year,
        summary: c.summary,
        beforeNote: c.beforeNote,
        afterNote: c.afterNote,
        highlights: [...c.highlights],
        published: true,
        sortOrder: i,
      })
      .onConflictDoUpdate({
        target: schema.caseStudies.slug,
        set: {
          title: c.title,
          category: c.category,
          categoryLabel: c.categoryLabel,
          location: c.location,
          year: c.year,
          summary: c.summary,
          beforeNote: c.beforeNote,
          afterNote: c.afterNote,
          highlights: [...c.highlights],
          sortOrder: i,
        },
      });
    n++;
  }
  console.log(`✓ case_studies: ${n} 筆（照片待後台上傳）`);
}

async function seedNav() {
  const items = [
    { label: "關於我們", href: "/about", sortOrder: 0 },
    { label: "服務項目", href: "/services", sortOrder: 1 },
    { label: "施工實績", href: "/portfolio", sortOrder: 2 },
    { label: "預約詢價", href: "/inquiry", sortOrder: 3 },
    { label: "聯絡我們", href: "/contact", sortOrder: 4 },
  ];
  for (const it of items) {
    const exists = await db.query.navMenuItems.findFirst({
      where: (n, { eq, and, isNull }) =>
        and(eq(n.href, it.href), isNull(n.parentId)),
    });
    if (!exists) await db.insert(schema.navMenuItems).values(it);
  }
  console.log(`✓ nav_menu_items: ${items.length} 個上層項目（服務子選單由已發佈 services 自動帶）`);
}

async function seedSettings() {
  const entries: Record<string, string> = {
    name: site.name,
    nameEn: site.nameEn,
    tagline: site.tagline,
    pitch: site.pitch,
    description: site.description,
    phone: site.phone,
    phoneHref: site.phoneHref,
    lineId: site.lineId,
    lineHref: site.lineHref,
    email: site.email,
    address: site.address,
    hours: site.hours,
    serviceArea: site.serviceArea,
    coreValues: JSON.stringify(coreValues),
  };
  for (const [key, value] of Object.entries(entries)) {
    await db
      .insert(schema.siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value } });
  }
  console.log(`✓ site_settings: ${Object.keys(entries).length} 個 key`);
}

async function seedSiteContent() {
  const keys = Object.keys(CONTENT_DEFAULTS);
  for (const key of keys) {
    await db
      .insert(schema.siteContent)
      .values({ sectionKey: key, contentJson: CONTENT_DEFAULTS[key] })
      .onConflictDoUpdate({
        target: schema.siteContent.sectionKey,
        set: { contentJson: CONTENT_DEFAULTS[key], updatedAt: new Date() },
      });
  }
  console.log(`✓ site_content: ${keys.length} 個區塊`);
}

async function main() {
  console.log("開始 seed …");
  await seedAdmin();
  await seedServices();
  await seedCaseStudies();
  await seedNav();
  await seedSettings();
  await seedSiteContent();
  console.log("完成。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
