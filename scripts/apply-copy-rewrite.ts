/**
 * 一次性：把「與業主實況不符」的公開文案改寫寫進資料庫（見 copy-rewrite-draft.md）。
 *
 *   npx tsx --env-file=.env scripts/apply-copy-rewrite.ts          # 預覽
 *   npx tsx --env-file=.env scripts/apply-copy-rewrite.ts --apply  # 寫入
 *
 * 範圍：首頁英雄區／取名大江／風火水標題區、關於頁三原則、網站描述、風火水三卡、
 *       屋頂防水與鐵皮屋防水兩個服務。外牆／浴廁／地下室維持下架，不動。
 * 刻意不寫：四合一工序（業主機密）、保固年限與條款。
 */
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";

import * as schema from "../lib/db/schema";
import { site, coreValues } from "../lib/site";
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

const BLOCK_KEYS = ["home.hero", "home.brandStory", "home.coreValues", "about.values"];

const WARRANTY = "完工後提供保固書，保固內容於施工前說明。";

const SERVICE_PATCH: Record<string, Partial<typeof schema.services.$inferInsert>> = {
  roof: {
    short: "水泥屋頂／露台",
    summary: "水泥屋頂與露台：抓漏、修補裂縫，搭配 SOUDAL 與 JUTA 防水隔熱材料。",
    headline: "頂樓一漏，全棟受潮。先抓漏、補裂縫，再做防水隔熱。",
    intro:
      "水泥屋頂與露台長年曝曬、熱脹冷縮，裂縫與接縫是最容易滲水的地方。大江防水到場先丈量、拍照，抓漏、修補裂縫並清潔基面，再搭配比利時 SOUDAL 與 JUTA 彈性防水兼防熱漆施作，依現場狀況與需求調整，讓屋頂不只不漏，也更耐曬、更能應付長期伸縮。",
    process: [
      { title: "場勘丈量", desc: "丈量實際坪數並拍照留存，與您確認範圍。" },
      { title: "抓漏、修補裂縫、清潔", desc: "先處理漏水點與裂縫，並清潔基面。" },
      { title: "底漆 2 層", desc: "施作底漆，穩固基面。" },
      { title: "防水層與隔熱", desc: "依現場狀況與需求搭配施作；有施作隔熱漆的部位同時具備隔熱效果。" },
      { title: "完工回報", desc: "拍照回報、附保固書，並清潔施工所帶來的髒污。" },
    ],
    materials:
      "搭配使用比利時 SOUDAL 處理裂縫與接縫，並依需求選用 JUTA 彈性防水兼防熱漆形成防水層。露台與水泥屋頂採同一套工法。",
    warranty: WARRANTY,
  },
  "metal-roof": {
    summary: "鐵皮屋頂四合一工法：隔熱、防水、降噪、保護鐵皮。",
    headline: "隔熱、防水、降噪、保護鐵皮，一次處理。",
    intro:
      "鐵皮屋白天吸熱、晚上散熱，加上浪板搭接與螺絲孔，常同時有漏水與悶熱的問題。大江防水採四合一工法，同時達到隔熱、防水、降噪與保護鐵皮的效果；施工前先場勘丈量、抓漏修補並清潔屋面，完工拍照回報並附保固書。",
    process: [
      { title: "場勘丈量", desc: "丈量實際坪數並拍照留存，與您確認範圍。" },
      { title: "抓漏、修補裂縫、清潔", desc: "處理漏水點與屋面。" },
      { title: "四合一施工", desc: "同時達到隔熱、防水、降噪、保護鐵皮的效果（施工細節不公開）。" },
      { title: "完工回報", desc: "拍照回報、附保固書，並清潔施工所帶來的髒污。" },
    ],
    materials: "以隔熱防水材料施作，詳細工序由師傅現場說明。",
    warranty: WARRANTY,
  },
};

async function main() {
  console.log(APPLY ? "== 實際寫入 ==" : "== 預覽（未寫入；加 --apply 才會寫入）==");

  for (const k of BLOCK_KEYS) {
    const v = CONTENT_DEFAULTS[k];
    if (!v) throw new Error(`CONTENT_DEFAULTS 缺 ${k}`);
    console.log(`區塊 ${k}: 覆寫`);
    if (APPLY)
      await db
        .insert(schema.siteContent)
        .values({ sectionKey: k, contentJson: v })
        .onConflictDoUpdate({
          target: schema.siteContent.sectionKey,
          set: { contentJson: v, updatedAt: new Date() },
        });
  }

  const settings: Record<string, string> = {
    description: site.description,
    coreValues: JSON.stringify(coreValues),
  };
  for (const [key, value] of Object.entries(settings)) {
    console.log(`設定 ${key}: 覆寫（${value.length} 字）`);
    if (APPLY)
      await db
        .insert(schema.siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value } });
  }

  for (const [slug, patch] of Object.entries(SERVICE_PATCH)) {
    const cur = await db.query.services.findFirst({
      where: eq(schema.services.slug, slug),
    });
    if (!cur) throw new Error(`找不到服務 ${slug}`);
    console.log(`服務 ${slug}: 更新 ${Object.keys(patch).join("、")}（published=${cur.published}）`);
    if (APPLY)
      await db.update(schema.services).set(patch).where(eq(schema.services.id, cur.id));
  }

  console.log(APPLY ? "完成。" : "預覽結束，資料庫未變動。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
