/**
 * 可由後台編輯的頁面文案區塊登記表（siteContent.sectionKey → 欄位結構）。
 * 前後端共用（不含 server-only）。CMS 的「頁面文案」編輯器依這份定義動態產生表單。
 */

export type BlockField =
  | { name: string; label: string; type: "text"; hint?: string }
  | { name: string; label: string; type: "textarea"; hint?: string }
  | {
      name: string;
      label: string;
      type: "stringList";
      itemLabel: string;
      hint?: string;
    }
  | {
      name: string;
      label: string;
      type: "objectList";
      itemFields: {
        name: string;
        label: string;
        type: "text" | "textarea";
      }[];
      hint?: string;
    };

export type BlockDef = {
  key: string;
  label: string;
  description: string;
  fields: BlockField[];
};

export const CONTENT_BLOCKS: BlockDef[] = [
  {
    key: "home.hero",
    label: "首頁 · 英雄區",
    description: "首頁最上方大浪區的文字與按鈕",
    fields: [
      { name: "badge", label: "品牌小標", type: "text" },
      { name: "title", label: "主標題", type: "textarea", hint: "可用換行分段" },
      { name: "subtitle", label: "副標描述", type: "textarea" },
      { name: "primaryCtaLabel", label: "主要按鈕文字", type: "text" },
      { name: "secondaryCtaLabel", label: "次要按鈕文字", type: "text" },
      {
        name: "assurances",
        label: "保證標籤",
        type: "stringList",
        itemLabel: "標籤",
      },
    ],
  },
  {
    key: "home.brandStory",
    label: "首頁 · 取名「大江」",
    description: "首頁品牌定位段落",
    fields: [
      { name: "kicker", label: "眉標", type: "text" },
      { name: "title", label: "標題", type: "textarea", hint: "可用換行分段" },
      {
        name: "paragraphs",
        label: "內文段落",
        type: "stringList",
        itemLabel: "段落",
      },
    ],
  },
  {
    key: "home.coreValues",
    label: "首頁 · 風火水三大核心（標題區）",
    description: "三大核心區的標題與結語（三張卡片內容在「網站設定」的核心價值）",
    fields: [
      { name: "kicker", label: "眉標", type: "text" },
      { name: "title", label: "標題", type: "textarea" },
      { name: "intro", label: "引言", type: "textarea" },
      { name: "footnote", label: "結語（引用區）", type: "textarea" },
    ],
  },
  {
    key: "about.intro",
    label: "關於頁 · 開頭",
    description: "關於頁標題與施工理念段落",
    fields: [
      { name: "pageLead", label: "頁面引言", type: "textarea" },
      { name: "kicker", label: "眉標", type: "text" },
      { name: "title", label: "標題", type: "text" },
      {
        name: "paragraphs",
        label: "內文段落",
        type: "stringList",
        itemLabel: "段落",
      },
    ],
  },
  {
    key: "about.timeline",
    label: "關於頁 · 一路走來",
    description: "沿革時間軸",
    fields: [
      { name: "kicker", label: "眉標", type: "text" },
      { name: "title", label: "標題", type: "text" },
      {
        name: "items",
        label: "階段",
        type: "objectList",
        itemFields: [
          { name: "year", label: "階段標記", type: "text" },
          { name: "title", label: "小標", type: "text" },
          { name: "desc", label: "說明", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "about.values",
    label: "關於頁 · 三個原則",
    description: "誠實 / 透明 / 負責",
    fields: [
      { name: "kicker", label: "眉標", type: "text" },
      { name: "title", label: "標題", type: "text" },
      {
        name: "items",
        label: "原則",
        type: "objectList",
        itemFields: [
          { name: "title", label: "標題", type: "text" },
          { name: "desc", label: "說明", type: "textarea" },
        ],
      },
    ],
  },
];

export function blockDef(key: string): BlockDef | undefined {
  return CONTENT_BLOCKS.find((b) => b.key === key);
}

/** 目前寫死在前台的預設值 —— seed 用，也是切換前逐頁比對的基準。 */
export const CONTENT_DEFAULTS: Record<string, Record<string, unknown>> = {
  "home.hero": {
    badge: "大江防水工程",
    title: "像治理江河一樣，\n為你的家擋下每一道滲水",
    subtitle:
      "屋頂、外牆、浴廁、地下室、鐵皮屋防水施工，並延伸高效隔熱與淨化通風。從漏水源頭判讀到蓄水測試驗收，施工前後對比實績公開，報價透明不含糊。",
    primaryCtaLabel: "預約免費勘驗",
    secondaryCtaLabel: "查看施工實績",
    assurances: ["免費現場勘驗", "透明報價", "蓄水測試驗收", "保固售後服務"],
  },
  "home.brandStory": {
    kicker: "關於大江",
    title: "取名「大江」，\n是對「治水」的自我要求",
    paragraphs: [
      "江河治理講究疏導與圍堵並重 —— 該擋的地方擋住、該排的地方排掉。防水工程是同樣的道理：找到水的來路，用對的工法阻斷，再把難免的水氣導向不會造成損害的地方。",
      "我們不接「先做再說」的案子。每一次施工都從現場勘驗與漏水判讀開始，報價逐項列清，完工以蓄水測試驗收，並提供書面保固。把每一戶的滲漏，當成自己家的事處理。",
    ],
  },
  "home.coreValues": {
    kicker: "風火水三大核心",
    title: "防水擋水、隔熱擋熱、通風去濕 —— 一次到位",
    intro:
      "以防水為本，延伸到隔熱與通風。三者一起處理，室內才不會這裡補好、那裡又悶出濕氣。",
    footnote:
      "防水擋住水、隔熱擋住熱、通風帶走濕氣與悶氣 —— 三者一起做，才是真正會呼吸的健康節能宅。",
  },
  "about.intro": {
    pageLead: "一支專注在「找到水、擋住水、導開水」的防水施工團隊。",
    kicker: "施工理念",
    title: "治水的邏輯，用在每一寸空間",
    paragraphs: [
      "防水工程最怕「頭痛醫頭」。水會沿著結構跑，看到水痕的地方往往不是真正的破口。我們的每一個案子都從現場勘驗與漏水路徑判讀開始，確認源頭後才決定工法與報價。",
      "施工過程逐項記錄，完工以蓄水測試或連續觀察確認成效，並提供書面保固。",
      "防水是大江的本業，也是我們理解建築的起點。同一套「找問題、對症下藥」的做法，我們延伸到高效隔熱與淨化通風 —— 水、火、風三者一起處理，才是真正會呼吸的健康節能宅。",
    ],
  },
  "about.timeline": {
    kicker: "一路走來",
    title: "從抓漏到整體防水",
    items: [
      {
        year: "起點",
        title: "從抓漏做起",
        desc: "以住宅抓漏與局部止漏起家，累積各種疑難滲漏的判讀經驗。",
      },
      {
        year: "擴編",
        title: "工班與工法擴充",
        desc: "導入高壓灌注、滲透結晶、高分子片材等工法，承接屋頂與外牆整體防水。",
      },
      {
        year: "現在",
        title: "住宅與廠房並行",
        desc: "服務範圍涵蓋透天、公寓、華廈與鐵皮廠房，提供書面保固與售後追蹤。",
      },
    ],
  },
  "about.values": {
    kicker: "我們在意的事",
    title: "三個不退讓的原則",
    items: [
      { title: "誠實", desc: "找不到源頭就說找不到，不會為了接案硬做。" },
      { title: "透明", desc: "報價逐項列清，追加一定先講。" },
      { title: "負責", desc: "保固期內滲漏免費處理，售後聯絡得到人。" },
    ],
  },
};
