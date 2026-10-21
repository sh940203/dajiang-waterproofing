# 大江防水官網 — Handoff

> 更新：2026-10-22 · 正式站 200 · 最後部署 Version `ed746943`（含業主內容與文案改寫；對應程式碼見 git log，部署後的文案改動需 commit）

## 1. 一句話狀態

**前台 + 後台 + CMS 全部完成並已上線**（Cloudflare Workers）。網址已給客戶／工作群組。剩下都是「上線後收尾」與「業主補資料」，沒有未完成的開發階段。

| 項目 | 值 |
|---|---|
| 正式網址 | https://dajiang-waterproofing.huhu940203.workers.dev |
| GitHub（private） | https://github.com/sh940203/dajiang-waterproofing（`origin/main` 已同步）|
| Worker | `dajiang-waterproofing`（Cloudflare 帳號 huhu940203@gmail.com）|
| 資料庫 | Turso（libSQL）|
| R2 buckets | `dajiang-media`（binding `MEDIA`）、`dajiang-waterproofing-opennext-cache`（binding `NEXT_INC_CACHE_R2_BUCKET`，OpenNext 寫死此名）|
| 最後部署 | Version `ed746943`（2026-10-22：業主資料、10 筆實績、文案改寫、外牆／浴廁／地下室下架）|
| 後台 | `/admin`（admin 密碼已由使用者自行更換）|

## 2. 技術棧與結構

Next.js **16.3.3**（App Router, Turbopack）· React 19.2 · Tailwind v4（CSS-first `@theme`，無 config 檔）· shadcn/ui · Drizzle ORM + `@libsql/client/web` · `@opennextjs/cloudflare` · GSAP · FullCalendar v6 · react-hook-form + zod · `hash-wasm`（argon2id）。

**⚠️ 這不是你熟悉的 Next.js** — `AGENTS.md` 要求改 code 前先讀 `node_modules/next/dist/docs/`。本專案踩過的差異：`middleware`→`proxy.ts`（`export function proxy`）、`revalidateTag` 需第 2 參數（Server Action 內改用 `updateTag(tag)`）、`PageProps<"/route">`/`LayoutProps` 為全域型別、`params`/`searchParams` 是 Promise。

```
app/
  (site)/            前台（layout = SiteHeader/Footer；首頁 about services services/[slug] portfolio inquiry contact）
  (admin)/admin/     後台（layout 做 session + editor 路徑把關）：leads customers projects calendar crews materials content/* users
  (admin-auth)/admin/login/   登入（只用 root layout）
  api/inquiry        公開詢價 POST（multipart，寫 leads + 照片進 R2）
  api/media/[...key] R2 代理（leads/ 需登入；cases/ 公開；擋 ..）
  layout.tsx sitemap.ts robots.ts   metadata / 網域寫死處（見 §5）
proxy.ts             /admin/* cookie 閘 + 注入 x-pathname header
lib/
  db/schema.ts index.ts        15+ 張表；getDb()（先讀 getCloudflareContext().env，再 fallback process.env）
  auth/                         自建 DB session（SHA-256 token、httpOnly cookie dj_session、30 天滑動）
  content/db.ts settings.ts     前台資料層（unstable_cache + 標籤 CONTENT_TAGS）
  content/blocks.ts             頁面文案區塊登記表 + CONTENT_DEFAULTS
  content/services.ts portfolio.ts site.ts   ← 只剩 seed 來源，執行期不再被頁面 import（除 NavNode 型別）
  storage/r2.ts                 getMediaBucket/putObject/deleteObjects/publicUrl
  validation/*                  zod schemas
scripts/seed.ts      建 admin + 灌入前台預設內容（可重複跑，會把 CMS 內容重置回預設！）
drizzle/             0000、0001（leads.admin_note）
wrangler.jsonc  open-next.config.ts  next.config.ts（initOpenNextCloudflareForDev）
public/brand/        great-wave.jpg great-wave-1400.jpg og-image.jpg logo.jpg
_source/grade.py     浪濤調色腳本（原圖 jpg 已 gitignore，只在使用者本機）
```

## 3. 已完成功能

- **前台**：7 頁型 + 5 服務動態頁；Hokusai《神奈川沖浪裏》（Met CC0，調色為品牌藍）GSAP ken-burns + 視差 + reduced-motion 降級 + LQIP；風火水三大核心；RWD；SEO（逐頁 meta、sitemap、robots、OG/Twitter 卡）。
- **後台**：認證／客戶／物料／工班／工程（含工班、物料關聯）／行事曆（月週檢視）／詢價收件匣（狀態流轉、備註、一鍵轉客戶／工程、照片）／CMS（網站設定、頁面文案 6 區塊、服務、實績＋前後照片上傳、導覽）／使用者管理。
- **權限**：`admin` 全部；`editor` 只有 總覽／預約詢價／內容管理（不含網站設定）。三層把關：側邊欄、layout 依路徑、server action `getAdminOrThrow()`。
- **快取**：前台讀取走 `unstable_cache`（標籤 `content:{services,cases,nav,settings,pages}`），CMS action 寫入後 `updateTag` + `revalidatePath("/","layout")`；使用者已實測編輯後前台立即生效。
- **品質關卡**（每次改動都要過）：`npm run build`、`npx eslint .`、`npx opennextjs-cloudflare build`。
- **上線前總檢查 7 項已全過**（200、前台內容與 preview 逐字一致、網域非 placeholder、未登入 /admin 全擋、詢價表單實送、手機版面、title/favicon/meta）。`security-review` 無 ≥8/10 信心的漏洞。

## 4. 常用指令

```bash
npm run dev                # 本機（next dev；R2 用 miniflare 模擬，不需真 bucket）
npm run preview            # 本機 Workers runtime，:8787
npm run deploy             # opennextjs-cloudflare build && deploy（部署 = 對外動作，需使用者明確同意）
npm run db:generate|db:migrate|db:seed|db:studio
npx wrangler secret list --name dajiang-waterproofing
```
Worker secrets（使用者自己設的）：`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`NEXT_PUBLIC_SITE_URL`。`SESSION_SECRET` 在 `.dev.vars.example` 但**程式沒用**。

## 5. 待辦／已知事項（優先序）

1. **輪替 Turso auth token（未做）** — `npm run deploy` 的 build 需要 Turso 憑證（`/services/[slug]` 靜態產生），OpenNext 會把根目錄 `.env`（含明文 `TURSO_*`、`SEED_ADMIN_*`）複製進 bundle（`.open-next/server-functions/default/.env`）並被 Next 內聯。CF secret 執行期會蓋過，站正常，但 bundle 內有舊明文。做法：Turso 產新 token → `wrangler secret put TURSO_AUTH_TOKEN` → 撤銷舊的 → 同步更新本機 `.env`/`.dev.vars`（**由使用者自己填值**）。
   根治（可選）：讓 `/services/[slug]` 改全動態、build 不碰 DB，並避免直接 `process.env.TURSO_*` 被內聯／`.env` 被打包。
2. **掛自訂網域時，三處寫死網址要一起改再 deploy**：`app/layout.tsx`（`SITE_URL`/metadataBase）、`app/sitemap.ts`（`BASE`）、`app/robots.ts`；並 `wrangler secret put NEXT_PUBLIC_SITE_URL`。原因：`NEXT_PUBLIC_SITE_URL` 是執行期 secret，build 期讀不到；`.env` 裡的是 localhost。
3. **業主補資料**：電話 `0958 146 555`、LINE `@576sbooq` 已提供；Email／地址仍空（前台自動隱藏）。業主已提供 10 筆真實實績（見 §8），取代 6 筆範例；照片走後台或腳本上傳到 R2 `cases/`。
4. **選配硬化**：`/api/media` 補 `X-Content-Type-Options: nosniff`；登入退避目前是 per-isolate 記憶體 Map（Workers 上很弱）。
5. 延後項目：`activityLog` 稽核表；服務／實績排序目前是 ↑/↓ 按鈕（非拖曳）。
6. 每次 `db:seed` 會把 CMS 內容覆寫回預設——正式資料上線後**不要再跑**，或先確認用途。

## 6. 踩坑清單

- **部署前務必 `rm -rf .next .open-next`**：`next build` 會沿用本機 `.next/cache/fetch-cache` 的 `unstable_cache` 舊資料，把「改 DB 前」的內容烤進 build 並上傳 R2 快取，線上就會是舊文案（2026-10-22 實際發生：第一次部署後線上仍是舊字、下架服務仍 200，清掉重部署後才正確）。直接改 DB（腳本）之後尤其要注意。

- 直接 `db:seed`（繞過 server action）不會 `updateTag`，`next dev` 磁碟快取要 `rm -rf .next`（有時加 `node_modules/.cache`，出現 `@vercel/turbopack-next/internal/font/google/font` 找不到就是這個）再重啟。
- 檔名不要含 `@`：Cloudflare 會 307 轉址到 `%40`（已把 `great-wave@1400.jpg` 改名 `great-wave-1400.jpg`）。
- hero `<img>` **不可加 `will-change`**（會糊）；hero 入場動畫靜止態必須是可見（瀏覽器預覽 pane 隱藏時 rAF/transition 會凍結）。
- Claude 內建瀏覽器 pane 常是隱藏狀態（viewport 0×0）：截圖會拍到 LQIP 模糊圖／空 logo、GSAP 被 IntersectionObserver 暫停——這是量測假象，用 curl/DOM 數據驗證；`dev server` 閒置會被關，登入 session 會掉。
- 表單自動化：用原生 setter + `input/change` 事件，`form.requestSubmit()`；`computer.type` 座標常點錯欄位。
- RHF + zod：數字欄位用字串驗證再在 action 轉型（`z.coerce.number()` 會讓 resolver 型別壞掉）；陣列類欄位用 `useState`，純量欄位走 RHF。
- DataTable 是 client component：不可從 server 傳 function props（只傳已渲染好的 ReactNode cells）。
- 全站 eslint 忽略 `.open-next/** .wrangler/** drizzle/**`。

## 7. 與使用者的工作約定（務必遵守）

- 使用者用**繁體中文**溝通；回報要誠實、逐項列結果，**有失敗就明講**，不含糊帶過。
- **機密由使用者自己填**：`.dev.vars`、`.env`、Cloudflare secrets（`wrangler secret put`）、`SEED_ADMIN_PASSWORD`、Turso token——不要產生、不要寫入實際值、不要在對話回顯。登入後台的密碼也由使用者在瀏覽器自行輸入。
- 不改寫 git history。commit 前先 `git status` + `git add -n .` 給使用者看清單、點頭才 commit；commit 訊息尾端加 `Co-Authored-By` trailer（見該 session 系統提示）。
- 部署／`wrangler secret`／網域等對外或不可逆動作：使用者明確要求才做；任何一步出現錯誤訊息**先停下來給他看，不要自己猜著改**。
- 驗證要「跟基準比對」，不是只跑過。
- 測試資料（客戶、工程、leads、測試帳號）測完要清掉，確認 Turso 回到乾淨狀態（目前：業務資料表全 0，`admin_users` 只有 `admin`，`services` 5、`case_studies` 6 為 seed 基準）。

## 8. 商業背景

**不向大江收費，本專案當作使用者的作品集**（2026-10-21 更新；先前曾估價 NT$72k–180k，已作廢）。網域年費仍由業主自付。業主已實際參與：回覆 QA、提供 10 筆真實實績。待確認：業主同意把此站放進作品集；公開頁面上的地址／業主名稱要收斂（見下）。

### 業主需求與限制（2026-10 QA 回覆＋電話）

- **內容規則**：材料品牌只放 JUTA PAINT（彈性防水兼防熱漆）與比利時 SOUDAL（速的奧），各附簡短特色／功能，不放證書。**鐵皮屋「四合一工法」的步驟是業主機密，禁止公開**（只能談材料與特色）。**保固條款暫不公開**（業主說做完再談怎麼呈現）。
- **新增服務（尚未做）**：採光罩（三種材質）、窗戶、天溝——簡單列出即可；採光罩只接較大面積（約 20–30 坪以上），不主打小案。細節由使用者向業主問。
- **聯絡**：LINE ID `@576sbooq`；另有 FB 粉專、IG（網址見業主 docx；IG 連結帶追蹤參數，使用前去掉）。
- **實績**：10 筆真實案例（PDF 第一頁；8 筆有前後照、第 9／10 筆無照片）。公開頁只顯示縣市＋區域、不列業主名稱（含私人住家與民宿）。第二頁驗收資料尚未收到。
- **功能訊號**：業主流程是 FB 引流 → 官方 LINE 改名／標籤。詢價收件匣已有狀態流轉；使用者認為更重要的是「狀態修改歷程」（＝延後項的 `activityLog`）。未來可能要「工班各自只看自己行程＋休假」（需第三種角色），業主目前先用 Google 表格，不急。另要求：短影片區塊（施工紀錄＋行銷片）、徵才／合作廠商專區（申請表單＋留聯絡方式）。
- **文案改寫（2026-10-22 已上線）**：站上早期自擬文案與業主實況不符（PU 主力、保固 3–5 年、蓄水測試、五類服務…），已依業主說法改寫，詳見 `copy-rewrite-draft.md`。**外牆／浴廁／地下室三個服務已下架（published=0，等業主確認有沒有做；確認有做就到後台重新發佈並補真實工序）**。
- **仍待業主確認**：服務範圍（站上仍是「台中 · 彰化 · 南投 · 苗栗」，但真實案例遍及宜蘭到花蓮）、營業時間、勘驗／報價是否免費、「大江」名字由來、保固年限可否公開、採光罩／窗戶／天溝內容、案例 9／10 照片。這幾項站上仍是舊值。

## 9. 近期 commits

```
ad85542 chore: og:image 換成 1200×630 裁切版
1fddd86 fix: metadataBase 寫死正式網址
efe40fe fix: 海浪 srcset 檔名去掉 @ + 補 og:image
8a165a4 chore: sitemap / robots 指向正式 workers.dev 網址
c379b5b feat: 後端建置 —— 認證 / CRM / 行事曆 / 詢價收件匣 / CMS / 權限
0bd087f Initial commit from Create Next App
```
