import { getCaseStudies, getServices } from "@/lib/content/db";
import { getSite } from "@/lib/content/settings";
import { SITE_URL } from "@/lib/site-url";

/**
 * /llms.txt —— 給 AI 助理（ChatGPT、Perplexity、Claude…）的網站純文字摘要。
 * 內容全部取自 CMS，與網站同源；未經業主確認的事實（服務範圍、營業時間、地址）刻意不寫。
 */
export async function GET() {
  const [site, services, cases] = await Promise.all([
    getSite(),
    getServices(),
    getCaseStudies(),
  ]);

  const lines = [
    `# ${site.name}${site.nameEn ? `（${site.nameEn}）` : ""}`,
    "",
    `> ${site.description}`,
    "",
    site.pitch,
    "",
    "## 服務項目",
    ...services.map(
      (s) => `- [${s.label}](${SITE_URL}/services/${s.slug})：${s.summary ?? ""}`,
    ),
    "",
    "## 施工實績",
    `共 ${cases.length} 件，皆附施工前後對比：${SITE_URL}/portfolio`,
    ...cases.map(
      (c) =>
        `- [${c.title}](${SITE_URL}/portfolio/${c.slug})：${[c.location, c.year].filter(Boolean).join("，")}`,
    ),
    "",
    "## 主要頁面",
    `- [關於我們](${SITE_URL}/about)：品牌故事與施工原則`,
    `- [預約詢價](${SITE_URL}/inquiry)：線上表單，可附照片`,
    `- [聯絡我們](${SITE_URL}/contact)`,
    "",
    "## 聯絡方式",
    site.phone && `- 電話：${site.phone}`,
    site.lineId && site.lineHref && `- LINE 官方帳號：${site.lineId}（${site.lineHref}）`,
    site.facebookUrl && `- Facebook：${site.facebookUrl}`,
    site.instagramUrl && `- Instagram：${site.instagramUrl}`,
    site.email && `- Email：${site.email}`,
  ].filter((l): l is string => typeof l === "string");

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
