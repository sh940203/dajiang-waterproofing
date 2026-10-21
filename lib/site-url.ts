/**
 * 正式網址（metadataBase / canonical / sitemap / robots / JSON-LD / llms.txt 共用）。
 * build 期讀不到 Cloudflare secret，且 .env 的 NEXT_PUBLIC_SITE_URL 是本機開發用的
 * localhost，所以直接寫死。掛自訂網域後只改這一行，再重新 deploy。
 */
export const SITE_URL = "https://dajiang-waterproofing.huhu940203.workers.dev";

/** 站內路徑（或 /api/media/... 這類相對網址）→ 絕對網址；已是絕對網址則原樣回傳 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
