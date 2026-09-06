/**
 * 全站基本設定（第一階段寫死，日後改由後台 site_settings / nav_menu_items 提供）
 */

export const site = {
  name: "大江防水",
  nameEn: "DAJIANG Waterproofing",
  tagline: "承接江河之名，為每一寸空間築起防水的堤防",
  /** 精簡定位（與江河敘事並存）：風火水三大核心 */
  pitch:
    "精準防水、高效隔熱、淨化通風 —— 用風火水三大核心，打造會呼吸的健康節能宅。",
  description:
    "大江防水工程 —— 屋頂、外牆、浴廁、地下室、鐵皮屋防水施工，並延伸高效隔熱與淨化通風。以風火水三大核心打造會呼吸的健康節能宅，提供免費現場勘驗、透明報價與施工前後對比實績。",
  phone: "0958 146 555",
  phoneHref: "tel:0958146555",
  // ── 以下尚未取得正式資訊，先留空；填入真值即會自動對外顯示 ──
  lineId: "",
  lineHref: "",
  email: "",
  address: "",
  // ────────────────────────────────────────────────────
  hours: "週一至週六 08:00 – 18:00",
  serviceArea: "台中 · 彰化 · 南投 · 苗栗",
} as const;

/**
 * 哪些聯絡管道已是正式資訊 —— 由值本身推導，填入真實內容後會自動對外顯示。
 * 未 ready 的管道，前台一律不呈現（也不會出現在 JS bundle 裡），
 * 避免給陌生客戶看到會退信 / 打不通的假資料。
 */
export const contactReady = {
  phone: Boolean(site.phone),
  line: Boolean(site.lineId && site.lineHref),
  email: Boolean(site.email),
  address: Boolean(site.address),
} as const;

export type NavNode = {
  label: string;
  href: string;
  /** 下拉子項目 */
  children?: { label: string; href: string; desc?: string }[];
};

/**
 * 風火水三大核心 —— 精簡定位，用來整合「江河／治水」品牌敘事與實際服務內容。
 * 防水為本業與錨點；隔熱、通風為隨防水工序一併施作的延伸。
 */
export const coreValues = [
  {
    element: "水",
    label: "精準防水",
    summary:
      "找到滲漏的來路，用對工法從源頭阻斷，完工以蓄水測試驗收。這是大江的本業，也是一切的基礎。",
  },
  {
    element: "火",
    label: "高效隔熱",
    summary:
      "屋頂、外牆的熱不進來，室內溫度穩、空調不空轉。防水層施作時一併處理隔熱，一道工序解決兩件事。",
  },
  {
    element: "風",
    label: "淨化通風",
    summary:
      "濕氣與悶熱要有出口。改善通風路徑、排除牆體與室內滯留的水氣，讓空間不再返潮、發霉。",
  },
] as const;

/** 服務分類（第一階段的真實來源；services 頁與導覽下拉共用） */
export const serviceCategories = [
  {
    slug: "roof",
    label: "屋頂防水",
    short: "屋頂／頂樓地坪",
    summary: "頂樓地坪、女兒牆、洩水坡度重整，PU 或高分子防水層施作。",
  },
  {
    slug: "exterior-wall",
    label: "外牆防水",
    short: "外牆／窗框滲水",
    summary: "外牆龜裂、窗框滲水、磁磚縫隙滲漏的高壓灌注與撥水處理。",
  },
  {
    slug: "bathroom",
    label: "浴廁防水",
    short: "浴室／廚房",
    summary: "浴室地坪、牆面重做防水層，不必全室敲除的局部止漏方案。",
  },
  {
    slug: "basement",
    label: "地下室防水",
    short: "地下室／擋土牆",
    summary: "地下室滲水、壁癌、地坪返潮的背水面灌注與導水處理。",
  },
  {
    slug: "metal-roof",
    label: "鐵皮屋防水",
    short: "鐵皮屋／廠房",
    summary: "鐵皮屋頂鏽蝕、搭接縫、螺絲孔滲漏，隔熱與防水一次施作。",
  },
] as const;

export type ServiceSlug = (typeof serviceCategories)[number]["slug"];

/** 主導覽（桌機下拉 / 手機手風琴共用結構） */
export const mainNav: NavNode[] = [
  { label: "關於我們", href: "/about" },
  {
    label: "服務項目",
    href: "/services",
    children: serviceCategories.map((c) => ({
      label: c.label,
      href: `/services/${c.slug}`,
      desc: c.short,
    })),
  },
  { label: "施工實績", href: "/portfolio" },
  { label: "預約詢價", href: "/inquiry" },
  { label: "聯絡我們", href: "/contact" },
];
