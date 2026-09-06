# 大江防水官網

前台形象網站 + 內部後台（CRM／工程／行事曆／詢價收件匣／全站 CMS）。

## 技術棧

| 範圍 | 用的東西 |
| --- | --- |
| 框架 | Next.js 16 App Router（Turbopack）、React 19、TypeScript |
| 樣式 | Tailwind CSS v4（CSS-first `@theme`）、shadcn/ui、GSAP |
| 資料庫 | Turso（libSQL）＋ Drizzle ORM |
| 檔案儲存 | Cloudflare R2（詢價附件、施工前後照片） |
| 部署 | Cloudflare Workers，透過 `@opennextjs/cloudflare` |
| 認證 | 自建 DB session（argon2id / `hash-wasm`，httpOnly cookie `dj_session`） |

## 本機開發

```bash
npm install
cp .dev.vars.example .dev.vars   # 填 Turso URL/token 等
cp .env.example .env             # CLI 工具用，通常同上
npm run dev                      # http://localhost:3000
```

- `.dev.vars`／`.env` 已被 gitignore，**永遠不要 commit**。
- `next dev` 會透過 `initOpenNextCloudflareForDev()` 讀 `.dev.vars` 與 `wrangler.jsonc` 的 bindings（R2 在本機用 miniflare 模擬，不需先建 bucket）。
- build 後若 `next dev` 出現字型模組錯誤或前台顯示舊內容 → `rm -rf .next node_modules/.cache` 再重跑。

### 環境變數

| 變數 | 用途 |
| --- | --- |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | 資料庫連線 |
| `NEXT_PUBLIC_SITE_URL` | metadata / sitemap 的站台網址 |
| `MEDIA_PUBLIC_BASE_URL` | （選填）R2 圖片對外網址；留空 = 走站內 `/api/media` 代理 |
| `SEED_ADMIN_USER` / `SEED_ADMIN_PASSWORD` | 只有第一次 `db:seed` 建立管理員時需要 |

正式環境用 `npx wrangler secret put <NAME>` 設定，不放進 `wrangler.jsonc`。

## 資料庫

```bash
npm run db:generate   # schema 改動後產生 migration（drizzle/）
npm run db:migrate    # 套用 migration 到 Turso
npm run db:seed        # 建第一個管理員 + 灌入前台預設內容（可重複執行刷新）
npm run db:studio      # Drizzle Studio
```

- Schema：`lib/db/schema.ts`。前台內容（服務／實績／導覽／設定／頁面文案）都在資料庫，由後台「內容管理」編輯。
- `scripts/seed.ts` 以 `lib/site.ts` / `lib/content/*.ts` 為種子來源；`scripts/b5-compare.ts` 比對 DB 與那份種子是否一致。
- **注意**：直接 `db:seed`（繞過後台 server action）不會觸發 `updateTag`，`next dev` 的資料快取需要 `rm -rf .next` 才會反映。

### 備份

Turso 匯出：

```bash
turso db shell <db-name> ".dump" > backup-$(date +%F).sql
# 還原：turso db shell <new-db> < backup-YYYY-MM-DD.sql
```

R2 物件（媒體）用 `npx wrangler r2 object get` 或 Cloudflare 儀表板匯出。

## 權限

- `admin`：全部功能 + 使用者管理。
- `editor`：只有「總覽」「預約詢價」「內容管理」（不含網站設定）。
- 把關點：側邊欄 `visibleNav`、`app/(admin)/admin/layout.tsx` 依路徑擋、各 server action 用 `getAdminOrThrow()`。

## 部署（Cloudflare Workers）

首次前置作業：

```bash
npx wrangler login
npx wrangler r2 bucket create dajiang-media
npx wrangler r2 bucket create dajiang-waterproofing-opennext-cache
# 設定 secrets：TURSO_DATABASE_URL / TURSO_AUTH_TOKEN / NEXT_PUBLIC_SITE_URL ...
```

之後：

```bash
npm run preview   # 本機用 Workers runtime 預覽
npm run deploy    # opennextjs-cloudflare build && deploy
```

部署前記得把 placeholder 網域 `dajiang-waterproofing.tw`（`app/sitemap.ts`、`app/robots.ts`、`NEXT_PUBLIC_SITE_URL`）換成正式網址。
