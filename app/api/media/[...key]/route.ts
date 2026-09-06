import { getCurrentUser } from "@/lib/auth";
import { getObject } from "@/lib/storage/r2";

/**
 * R2 媒體代理。沒有設定 `MEDIA_PUBLIC_BASE_URL` 時，圖片就從這裡送出。
 * - `leads/` 前綴 = 詢價附件，屬敏感資料 → 需登入後台。
 * - 其他前綴（例如日後的 `cases/`）視為公開。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.map((s) => decodeURIComponent(s)).join("/");

  if (objectKey.includes("..") || objectKey.startsWith("/")) {
    return new Response("Bad request", { status: 400 });
  }

  const isLeadAsset = objectKey.startsWith("leads/");
  if (isLeadAsset) {
    const user = await getCurrentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
  }

  const obj = await getObject(objectKey);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set(
    "Content-Type",
    obj.httpMetadata?.contentType ?? "application/octet-stream",
  );
  // 詢價附件屬敏感、可能被刪，短快取；公開資產可長快取
  headers.set(
    "Cache-Control",
    isLeadAsset ? "private, max-age=60" : "public, max-age=3600",
  );
  if (obj.size) headers.set("Content-Length", String(obj.size));

  return new Response(obj.body as unknown as ReadableStream, { headers });
}
