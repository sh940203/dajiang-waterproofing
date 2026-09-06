import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /**
   * 第二階段：後台需要 server 端（認證、DB、server actions），
   * 改用 @opennextjs/cloudflare 部署到 Cloudflare Workers（見 open-next.config.ts / wrangler.jsonc）。
   * 圖片最佳化伺服器暫不啟用（維持 unoptimized，避免多一個 Workers IMAGES binding 的風險）。
   */
  images: {
    unoptimized: true,
  },
};

// 讓 `next dev` 也能透過 getCloudflareContext() 取得 .dev.vars / wrangler bindings
initOpenNextCloudflareForDev();

export default nextConfig;
