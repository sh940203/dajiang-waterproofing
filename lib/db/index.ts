import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/lib/db/schema";

export { schema };

type Creds = { url: string; authToken?: string };

function readCreds(): Creds {
  // App runtime（Workers / next dev via OpenNext）：從 Cloudflare context 讀 secret
  try {
    const env = getCloudflareContext().env as unknown as Record<
      string,
      string | undefined
    >;
    if (env.TURSO_DATABASE_URL) {
      return { url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN };
    }
  } catch {
    // 不在 request scope（build 期間）→ 落到 process.env
  }
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "缺少 TURSO_DATABASE_URL（.dev.vars 本機 / Cloudflare secret 正式）",
    );
  }
  return { url, authToken: process.env.TURSO_AUTH_TOKEN };
}

let cached: ReturnType<typeof makeDb> | null = null;
let cachedUrl = "";

function makeDb({ url, authToken }: Creds) {
  return drizzle(createClient({ url, authToken }), { schema });
}

/** 取得（並在同一 isolate 內快取）Drizzle 連線。 */
export function getDb() {
  const { url, authToken } = readCreds();
  if (!cached || cachedUrl !== url) {
    cached = makeDb({ url, authToken });
    cachedUrl = url;
  }
  return cached;
}

export type DB = ReturnType<typeof getDb>;
