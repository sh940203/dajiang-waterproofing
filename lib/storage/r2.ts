import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { R2Bucket, R2ObjectBody } from "@cloudflare/workers-types";

/* ------------------------------------------------------------------ */
/*  上傳限制                                                           */
/* ------------------------------------------------------------------ */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 單張 6MB
export const MAX_FILES_PER_LEAD = 6;

type MediaEnv = {
  MEDIA?: R2Bucket;
  MEDIA_PUBLIC_BASE_URL?: string;
};

function readEnv(): MediaEnv {
  try {
    return getCloudflareContext().env as unknown as MediaEnv;
  } catch {
    // 不在 request scope（build 期間）
    return {};
  }
}

/** 取得 MEDIA R2 bucket；bucket 尚未建立 / 綁定時回 null（呼叫端需自行降級）。 */
export function getMediaBucket(): R2Bucket | null {
  return readEnv().MEDIA ?? null;
}

export function extForType(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export type ImageCheck = { ok: true } | { ok: false; error: string };

/** 伺服器端最後防線；前端也會先擋一次。 */
export function checkImage(file: { type: string; size: number }): ImageCheck {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: "僅接受 JPG / PNG / WebP 圖片" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "單張圖片不可超過 6MB" };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/*  物件操作                                                           */
/* ------------------------------------------------------------------ */
export async function putObject(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const bucket = getMediaBucket();
  if (!bucket) throw new Error("R2 MEDIA binding 不存在（bucket 尚未建立或未綁定）");
  await bucket.put(key, body, { httpMetadata: { contentType } });
}

export async function getObject(key: string): Promise<R2ObjectBody | null> {
  const bucket = getMediaBucket();
  if (!bucket) return null;
  return (await bucket.get(key)) ?? null;
}

/** 刪除一或多個物件；bucket 不存在時靜默略過。 */
export async function deleteObjects(keys: string[]): Promise<void> {
  const bucket = getMediaBucket();
  if (!bucket || keys.length === 0) return;
  await bucket.delete(keys);
}

/**
 * 產生對外可讀的圖片網址。
 * - 設了 `MEDIA_PUBLIC_BASE_URL`（r2.dev 或自訂網域）→ 直接指向 R2。
 * - 沒設 → 走站內 `/api/media/*` 代理（`leads/` 前綴會要求登入）。
 */
export function publicUrl(key: string): string {
  const base = readEnv().MEDIA_PUBLIC_BASE_URL;
  if (base) return `${base.replace(/\/+$/, "")}/${key}`;
  return `/api/media/${key}`;
}
