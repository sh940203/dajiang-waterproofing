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
    key: "home.materials",
    label: "首頁／服務頁 · 使用材料",
    description: "合作材料品牌卡（JUTA、SOUDAL）與「為什麼推薦 SOUDAL」說明",
    fields: [
      { name: "kicker", label: "眉標", type: "text" },
      { name: "title", label: "標題", type: "text" },
      { name: "intro", label: "引言", type: "textarea" },
      {
        name: "items",
        label: "材料品牌",
        type: "objectList",
        itemFields: [
          { name: "name", label: "品牌名稱", type: "text" },
          { name: "tagline", label: "一句話定位", type: "text" },
          { name: "desc", label: "品牌簡介", type: "textarea" },
          { name: "features", label: "功能與特色", type: "textarea" },
        ],
      },
      { name: "whyTitle", label: "推薦說明標題", type: "text" },
      {
        name: "whyParagraphs",
        label: "推薦說明段落",
        type: "stringList",
        itemLabel: "段落",
      },
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
      "屋頂與鐵皮屋防水施工，並延伸高效隔熱與淨化通風。師傅到場先丈量、拍照，與您取得共識後才施工；完工拍照回報，並附保固書。",
    primaryCtaLabel: "預約免費勘驗",
    secondaryCtaLabel: "查看施工實績",
    assurances: ["場勘丈量拍照", "有共識才施工", "完工拍照回報", "附保固書"],
  },
  "home.brandStory": {
    kicker: "關於大江",
    title: "把水擋在外面，\n也讓屋子住得更舒服",
    paragraphs: [
      "大江防水從抓漏出發，後來發現很多屋頂的問題不只漏水 —— 夏天曬得像烤箱、下雨擔心滲水。所以我們把防水、隔熱、通風放在一起思考。",
      "每次施工，師傅會先丈量、拍照，跟您確認做法、有共識才開始；完工後拍照回報、附保固書，並把施工的髒污清乾淨。",
    ],
  },
  "home.coreValues": {
    kicker: "風火水三大核心",
    title: "防水擋水、隔熱擋熱、通風排熱 —— 一次到位",
    intro:
      "以防水為本，延伸到隔熱與通風。三者一起處理，室內才不會這裡補好、那裡又悶熱難耐。",
    footnote:
      "防水擋住水、隔熱擋住熱、通風讓累積的熱氣排出去 —— 三者一起做，才是真正會呼吸的健康節能宅。",
  },
  "home.materials": {
    kicker: "使用材料",
    title: "選用兩個專注防水與耐候的材料品牌",
    intro: "依屋頂的狀況與需求，搭配適合的材料，而不是一種材料用到底。",
    items: [
      {
        name: "JUTA PAINT 久大塗料",
        tagline: "彈性防水兼防熱漆",
        desc: "久大塗料創立於 1969 年，長期專注於建築防水及環保水性塗料的研發與製造，產品涵蓋防水、防熱、防霉及彈性塗料。",
        features:
          "採用彈性壓克力樹脂，添加中空陶磁及防熱粒子，兼具防水、隔熱、彈性及耐候性。可填補細小裂痕，適用於水泥屋頂、外牆、鐵皮及貨櫃等戶外建築表面。官方資料標示可依建築材質降低室內約 2～5℃。",
      },
      {
        name: "SOUDAL 速的奧（比利時）",
        tagline: "針對特殊建物、嚴苛環境、水泥屋頂",
        desc: "SOUDAL（速的奧）創立於 1966 年，是來自比利時的全球品牌，專精於密封膠、PU 發泡劑及黏著劑，產品行銷全球 140 多國，以黏著力、彈性與創新研發著稱。",
        features:
          "不同於一般防水材及矽利康容易發霉、斷裂脆化，具備耐酸、耐鹼、耐腐蝕、抗紫外線等特性，適合講究施工品質的屋頂與建物。",
      },
    ],
    whyTitle: "為什麼我們推薦 SOUDAL 速的奧？",
    whyParagraphs: [
      "一般 PU 防水，主要是在屋頂表面形成一層防水膜。但屋頂每天都在接受太陽曝曬、下雨與溫差變化，加上建築物本身會伸縮，久了防水層容易老化，裂縫、接縫也可能再次出現問題。",
      "所以我們選擇使用比利時 SOUDAL 速的奧。它不是單純「塗一層防水漆」，而是依照不同的位置和問題，選擇適合的材料來處理：裂縫要處理、接縫要密封、基面要做好，最後再完整施作防水層。",
      "目的是讓防水不只是「現在不漏」，而是盡可能更耐曬、更耐候，也更能應付屋頂長期的伸縮變化。",
    ],
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
    title: "我們一定做到的三件事",
    items: [
      { title: "先丈量、拍照，有共識才施工", desc: "實際坪數與現況先確認，說明清楚才開始。" },
      { title: "完工拍照回報", desc: "每個案子完工都拍照回報給您。" },
      { title: "附保固書、清潔收尾", desc: "出具保固書，並清潔施工所帶來的髒污。" },
    ],
  },
};
