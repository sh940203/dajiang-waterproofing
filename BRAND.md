# 大江防水 — 品牌視覺色彩系統

色彩取樣自公司 Logo（浮世繪風格・藍染 × 宣紙）。所有數值定義於 `app/globals.css` 的 `@theme`，
以 Tailwind class 使用（如 `bg-ink-800`、`text-paper-200`、`border-seal-500`）。

## 從 Logo 取樣的原始色

| 來源位置 | 取樣色 | 說明 |
|---|---|---|
| 背景宣紙 | `#FFFAF7` | 暖白，帶極淡的米色 |
| 「大江」書法字 | `#1B345A` | 靛藍墨色，品牌主色 |
| 海浪 / 雲紋線稿 | `#34597D` / `#5882AA` | 中間藍、水藍 |
| 中央月輪 | `#4E7BA3` | 青藍 |
| 角落印章 | 硃砂紅（原圖已褪色，還原為 `#C0392B`） | 點綴色 |

## 語意色票

### 藍染色階 `ink-*`（由深墨到淺天）
`ink-950 #101f33` · `ink-900 #16293f` · **`ink-800 #1b345a`（主色／標題）** ·
`ink-700 #24466b` · **`ink-600 #34597d`（互動／連結）** · `ink-500 #4e7ba3` ·
`ink-400 #5882aa` · `ink-300 #7ba1c4` · `ink-200 #9dc0da` · `ink-100 #c7dcea` · `ink-50 #e8f1f7`

### 宣紙色階 `paper-*`（頁面底色與卡片）
`paper-50 #ffffff` · `paper-100 #fdfbf7`（卡片） · **`paper-200 #fbf7f1`（頁面底色）** ·
`paper-300 #f4ede1` · `paper-400 #e9dfce` · `paper-500 #d9ccb4`

### 硃砂印泥 `seal-*`（點綴色，克制使用：CTA 強調、必填星號、關鍵動作）
`seal-600 #9c2b21` · **`seal-500 #c0392b`** · `seal-400 #d5624f`

### 中性別名
- `background` = `paper-200`　`surface` = `paper-100`
- `foreground` `#2b3a4a`（內文）　`heading` = `ink-800`　`muted` `#6b7683`
- `border` `#e4ddcf`　`accent` = `seal-500`

## 字體
- 標題：Noto Serif TC（`--font-serif`）— 明體，帶東洋書卷氣
- 內文 / UI：Noto Sans TC（`--font-sans`）
- Logo 內的毛筆字僅存在於圖檔，網站不另尋毛筆字型

## 用色原則
1. 大面積用宣紙色，藍染色用於文字、線條、圖示與深色區塊（頁尾、CTA band）。
2. 硃砂紅只點綴，一個畫面通常不超過一處。
3. 深色區塊（`bg-ink-800` / `bg-ink-900`）文字用 `paper-100` / `paper-200`。
4. 互動焦點框統一 `outline` 用 `ink-600`。
