/**
 * 一次性：把業主 2026-10 提供的資料寫進資料庫（聯絡社群、品牌故事、材料品牌、10 筆實績）。
 *
 *   npx tsx --env-file=.env scripts/apply-owner-content.ts          # 預覽（不寫入）
 *   npx tsx --env-file=.env scripts/apply-owner-content.ts --apply  # 實際寫入
 *
 * - 以 key / slug upsert，可重複執行
 * - 舊的 6 筆範例實績只「下架」(published=false)，不刪除
 * - 照片只寫 DB 紀錄（key = cases/<slug>/{before,after}.jpg）；R2 檔案另用 wrangler 上傳
 * - 刻意不寫入：四合一工法步驟（業主機密）、保固條款、業主名稱與完整地址
 */
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { eq, inArray, notInArray } from "drizzle-orm";

import * as schema from "../lib/db/schema";
import { CONTENT_DEFAULTS } from "../lib/content/blocks";

const APPLY = process.argv.includes("--apply");

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("缺少 TURSO_DATABASE_URL（放在 .env）");
  process.exit(1);
}
const db = drizzle(
  createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
  { schema },
);

/* ---------------- 網站設定 ---------------- */
const SETTINGS: Record<string, string> = {
  lineId: "@576sbooq",
  lineHref: "https://line.me/R/ti/p/%40576sbooq",
  // 去掉追蹤參數（mibextid / stkn / utm_source）
  facebookUrl: "https://www.facebook.com/share/1EfT88Wxxp/",
  instagramUrl: "https://www.instagram.com/dajiang_2026",
};

/* ---------------- 頁面文案區塊 ---------------- */
const CONTENT: Record<string, Record<string, unknown>> = {
  "home.materials": CONTENT_DEFAULTS["home.materials"],
  "about.intro": {
    pageLead: "從防水開始，延伸到隔熱與通風，守護建築裡的人。",
    kicker: "品牌故事",
    title: "從「把水堵住」，到「讓建築住得更舒服」",
    paragraphs: [
      "大江防水的開始，來自一個很常見的問題：在一次次的工程現場，我們看見許多屋主為了漏水傷透腦筋。但真正走上屋頂後發現，很多房子的問題不只有「漏水」——夏天屋頂曬了一整天，室內熱得像烤箱；遇到下雨又擔心滲水；鐵皮屋更是白天吸熱、晚上散熱，室內溫度一直讓人很難受。",
      "我們開始思考：一棟房子，難道只能漏了補、熱了開冷氣嗎？於是把目光從「防止漏水」慢慢延伸到「改善建築」，研究不同的防水材料、隔熱塗料與施工方式，讓屋頂不只防水，也能降低熱能進入室內。",
      "慢慢地，我們建立起現在的施工理念：防水，是先把水擋在外面；隔熱，是減少熱進到屋裡；通風，則是讓累積的熱氣有機會排出去。三件事其實都在解決同一件事——讓建築住起來更舒服，也讓屋主少一點長期維修的煩惱。",
      "所以現在的大江防水，會從屋頂的狀況開始看：哪裡需要抓漏、哪裡有裂縫、排水是否順暢、表面是否長期吸熱，再依照建築的需求選擇適合的材料與施工方式。我們希望做的，不是一個做完就結束的工程，而是一個能真正改善建築問題的工程。",
    ],
  },
  "about.timeline": {
    kicker: "一路走來",
    title: "從防水出發，一路走向整體改善",
    items: [
      {
        year: "起點",
        title: "看見屋主的煩惱",
        desc: "在一次次工程現場，看見許多屋主為了漏水傷透腦筋，也發現很多房子的問題不只有漏水：夏天悶熱、下雨滲水、鐵皮屋白天吸熱晚上散熱。",
      },
      {
        year: "轉變",
        title: "從防止漏水到改善建築",
        desc: "研究不同的防水材料、隔熱塗料與施工方式，思考怎麼讓屋頂不只防水，也能降低熱能進入室內。",
      },
      {
        year: "現在",
        title: "防水、隔熱、通風一起處理",
        desc: "先把水擋在外面，再減少熱進到屋裡，並讓累積的熱氣排出去；從屋頂現況判斷，再選擇適合的材料與施工方式。",
      },
    ],
  },
};

/* ---------------- 施工實績 ---------------- */
type CaseSeed = {
  slug: string;
  title: string;
  category: "roof" | "metal-roof";
  location: string; // 只到縣市＋區域，不含路段門牌
  year: string;
  summary: string;
  highlights: string[];
  photo: boolean;
};

// 四合一工法步驟屬業主機密：此處只寫工程名稱、規模與非機密的前後置作業。
const metal = (坪: number) =>
  `鐵皮屋頂約 ${坪} 坪四合一工程。施工前先場勘丈量，抓漏、修補裂縫並清潔屋面，完工後拍照回報，並附保固書。`;

const CASES: CaseSeed[] = [
  {
    slug: "yilan-roof-leak-repair",
    title: "屋頂漏水結構處理",
    category: "roof",
    location: "宜蘭縣 員山鄉",
    year: "2026",
    summary:
      "屋頂漏水結構處理，工期 3 天。先清洗屋頂基面與排水溝槽的淤泥，施作防水底漆 1 次，再以比利時 SOUDAL 塗層 2 次、Dulux 防水面漆 1 次完成。",
    highlights: ["基面與排水溝清洗", "比利時 SOUDAL 塗層 2 次", "Dulux 防水面漆"],
    photo: true,
  },
  {
    slug: "pingtung-temple-roof",
    title: "寺廟屋頂修繕",
    category: "roof",
    location: "屏東縣 屏東市",
    year: "2026",
    summary:
      "寺廟前院小屋簷、住所、大殿與小屋頂的屋頂修繕，工期 4 天。包含基面清潔、除鏽與防水處理。",
    highlights: ["多處屋頂分區施工", "基面清潔除鏽", "完工拍照回報"],
    photo: true,
  },
  {
    slug: "tainan-metal-roof-350",
    title: "鐵皮屋頂四合一工程 350 坪",
    category: "metal-roof",
    location: "臺南市 永康區",
    year: "2026",
    summary:
      "鐵皮屋頂約 350 坪四合一工程。施工前檢查並清潔屋頂基面、整理排水管與電線，完工後封邊收尾並清理現場。",
    highlights: ["大面積屋頂", "排水管線整理", "完工清理現場"],
    photo: true,
  },
  {
    slug: "hsinchu-metal-roof-280",
    title: "鐵皮屋頂四合一工程 280 坪",
    category: "metal-roof",
    location: "新竹縣 寶山鄉",
    year: "2026",
    summary: metal(280),
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: true,
  },
  {
    slug: "miaoli-metal-roof-330",
    title: "鐵皮屋頂四合一工程 330 坪",
    category: "metal-roof",
    location: "苗栗縣 頭份市",
    year: "2026",
    summary: metal(330),
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: true,
  },
  {
    slug: "taoyuan-metal-roof-170",
    title: "鐵皮屋頂四合一工程 170 坪",
    category: "metal-roof",
    location: "桃園市 蘆竹區",
    year: "2026",
    summary: metal(170),
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: true,
  },
  {
    slug: "jiufen-felt-roof-50",
    title: "油毛氈屋頂修復 50 坪",
    category: "roof",
    location: "新北市",
    year: "2025",
    summary:
      "約 50 坪的油毛氈屋頂修復。施工前先場勘丈量，抓漏、修補裂縫並清潔屋面，完工後拍照回報，並附保固書。",
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: true,
  },
  {
    slug: "hualien-metal-roof-72",
    title: "鐵皮屋頂四合一工程 72 坪",
    category: "metal-roof",
    location: "花蓮縣 花蓮市",
    year: "2026",
    summary: metal(72),
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: true,
  },
  {
    slug: "hualien-metal-roof-40",
    title: "鐵皮屋頂四合一工程 40 坪",
    category: "metal-roof",
    location: "花蓮縣 吉安鄉",
    year: "2026",
    summary: metal(40),
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: false,
  },
  {
    slug: "hualien-temple-roof-70",
    title: "寺廟屋頂修繕 70 坪",
    category: "roof",
    location: "花蓮縣 光復鄉",
    year: "2026",
    summary:
      "寺廟屋頂約 70 坪修繕。施工前先場勘丈量，抓漏、修補裂縫並清潔屋面，完工後拍照回報，並附保固書。",
    highlights: ["場勘丈量", "抓漏修補", "附保固書"],
    photo: false,
  },
];

async function main() {
  console.log(APPLY ? "== 實際寫入 ==" : "== 預覽（未寫入；加 --apply 才會寫入）==");

  const svc = await db.select().from(schema.services);
  const label = new Map(svc.map((s) => [s.slug, s.label]));
  for (const c of CASES) {
    if (!label.has(c.category)) throw new Error(`找不到服務 slug：${c.category}`);
  }

  /* 設定 */
  const curSettings = new Map(
    (await db.select().from(schema.siteSettings)).map((r) => [r.key, r.value]),
  );
  for (const [k, v] of Object.entries(SETTINGS)) {
    console.log(`設定 ${k}: ${JSON.stringify(curSettings.get(k) ?? null)} → ${v}`);
    if (APPLY)
      await db
        .insert(schema.siteSettings)
        .values({ key: k, value: v })
        .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value: v } });
  }

  /* 頁面區塊 */
  const curContent = new Set(
    (await db.select().from(schema.siteContent)).map((r) => r.sectionKey),
  );
  for (const [k, v] of Object.entries(CONTENT)) {
    console.log(`區塊 ${k}: ${curContent.has(k) ? "覆寫既有" : "新增"}`);
    if (APPLY)
      await db
        .insert(schema.siteContent)
        .values({ sectionKey: k, contentJson: v })
        .onConflictDoUpdate({
          target: schema.siteContent.sectionKey,
          set: { contentJson: v, updatedAt: new Date() },
        });
  }

  /* 實績：舊範例下架 */
  const newSlugs = CASES.map((c) => c.slug);
  const old = await db
    .select()
    .from(schema.caseStudies)
    .where(notInArray(schema.caseStudies.slug, newSlugs));
  for (const o of old)
    console.log(`下架舊範例：${o.slug}（published=${o.published}）`);
  if (APPLY && old.length)
    await db
      .update(schema.caseStudies)
      .set({ published: false })
      .where(
        inArray(
          schema.caseStudies.id,
          old.map((o) => o.id),
        ),
      );

  /* 實績：upsert */
  const existing = await db
    .select()
    .from(schema.caseStudies)
    .where(inArray(schema.caseStudies.slug, newSlugs));
  const bySlug = new Map(existing.map((e) => [e.slug, e]));

  for (const [i, c] of CASES.entries()) {
    const row = {
      slug: c.slug,
      title: c.title,
      category: c.category,
      categoryLabel: label.get(c.category) ?? c.category,
      location: c.location,
      year: c.year,
      summary: c.summary,
      beforeNote: null,
      afterNote: null,
      highlights: c.highlights,
      published: true,
      sortOrder: i,
    };
    const hit = bySlug.get(c.slug);
    console.log(
      `${hit ? "更新" : "新增"} 實績 #${i + 1} ${c.slug}｜${c.location}｜${c.title}｜照片：${c.photo ? "有" : "無"}`,
    );
    if (!APPLY) continue;

    let id = hit?.id;
    if (hit) {
      await db.update(schema.caseStudies).set(row).where(eq(schema.caseStudies.id, hit.id));
    } else {
      const [ins] = await db
        .insert(schema.caseStudies)
        .values(row)
        .returning({ id: schema.caseStudies.id });
      id = ins.id;
    }
    if (c.photo && id) {
      const has = await db
        .select()
        .from(schema.caseStudyPhotos)
        .where(eq(schema.caseStudyPhotos.caseStudyId, id));
      if (has.length === 0)
        await db.insert(schema.caseStudyPhotos).values({
          caseStudyId: id,
          beforeKey: `cases/${c.slug}/before.jpg`,
          afterKey: `cases/${c.slug}/after.jpg`,
          sortOrder: 0,
        });
    }
  }
  console.log(APPLY ? "完成。" : "預覽結束，資料庫未變動。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
