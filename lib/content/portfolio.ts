import type { ServiceSlug } from "@/lib/site";

export type CaseStudy = {
  slug: string;
  title: string;
  category: ServiceSlug;
  categoryLabel: string;
  location: string;
  year: string;
  summary: string;
  /** 施工前後對比（第一階段留空，前台以樣式化佔位呈現；日後接 R2 圖片 URL） */
  before?: string;
  after?: string;
  beforeNote: string;
  afterNote: string;
  /** 施工重點 */
  highlights: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "taichung-rooftop-pu",
    title: "台中透天頂樓 PU 防水重做",
    category: "roof",
    categoryLabel: "屋頂防水",
    location: "台中市 西屯區",
    year: "2025",
    summary:
      "屋齡 20 年透天，頂樓地坪龜裂、女兒牆滲水導致四樓天花板壁癌。打除劣化層、重整洩水後施作 PU 三道與抗UV面漆。",
    beforeNote: "地坪多處龜裂、既有防水層起泡脫層，牆角積水。",
    afterNote: "整體無接縫 PU 防水層，洩水順暢，蓄水測試 48 小時無滲漏。",
    highlights: ["重整洩水坡度", "女兒牆壓條收邊", "伸縮縫加不織布補強", "3 年保固"],
  },
  {
    slug: "changhua-factory-metalroof",
    title: "彰化鐵皮廠房屋面止漏 + 隔熱",
    category: "metal-roof",
    categoryLabel: "鐵皮屋防水",
    location: "彰化縣 和美鎮",
    year: "2025",
    summary:
      "廠房浪板搭接與螺絲孔大量滲漏，夏季室內悶熱。更換老化螺絲、縫口補強後整面滾塗彈性防水，加做陶瓷隔熱面漆。",
    beforeNote: "螺絲孔鏽蝕、搭接縫翹起，天溝鏽穿溢水。",
    afterNote: "連續彈性防水層 + 高反射隔熱面漆，實測屋面表溫下降。",
    highlights: ["更換 400+ 顆螺絲墊片", "天溝 FRP 內襯", "屋脊補強布加厚", "隔熱陶瓷面漆"],
  },
  {
    slug: "nantou-bathroom-local",
    title: "南投公寓浴室局部止漏（免敲磚）",
    category: "bathroom",
    categoryLabel: "浴廁防水",
    location: "南投縣 草屯鎮",
    year: "2024",
    summary:
      "樓下天花板滴水，樓上浴室磁磚完好。採滲透結晶帶水施作於地坪與地排周圍，重做防霉填縫，未拆除任何磁磚。",
    beforeNote: "樓下天花板滴水、油漆膨起，地排周圍縫隙滲黑。",
    afterNote: "封地排蓄水測試樓下無滲漏，浴室外觀維持原狀。",
    highlights: ["滲透結晶帶水施作", "地排管根加強", "防霉填縫更新", "當日完工"],
  },
  {
    slug: "miaoli-basement-injection",
    title: "苗栗別墅地下室湧水灌注導水",
    category: "basement",
    categoryLabel: "地下室防水",
    location: "苗栗縣 頭份市",
    year: "2024",
    summary:
      "地下室施工冷縫湧水、地坪返潮。沿冷縫植針高壓灌注發泡止水，牆面滲透結晶強化，低點加設集水坑接自動抽水。",
    beforeNote: "冷縫線狀流水，牆面大面積壁癌、地坪常年潮濕。",
    afterNote: "灌注後止水，牆面重做防水砂漆，濕度明顯下降。",
    highlights: ["冷縫植針灌注", "滲透結晶強化", "集水坑 + 自動抽水", "2 年止水保固"],
  },
  {
    slug: "taichung-exterior-wall-injection",
    title: "台中華廈外牆窗框滲水高壓灌注",
    category: "exterior-wall",
    categoryLabel: "外牆防水",
    location: "台中市 北屯區",
    year: "2024",
    summary:
      "12 樓住戶主臥窗框雨後滲水。以吊掛方式從外牆窗周裂縫高壓灌注環氧樹脂，補修收邊後整窗面撥水處理，未動室內裝修。",
    beforeNote: "窗框下緣與牆體接縫滲水，室內牆面水漬擴散。",
    afterNote: "灌注封填水路，外牆窗周撥水處理，連續降雨測試無滲入。",
    highlights: ["高空吊掛作業", "環氧樹脂灌注", "窗周彈性收邊", "矽烷撥水面層"],
  },
  {
    slug: "changhua-townhouse-roof-sheet",
    title: "彰化連棟透天屋頂高分子片材",
    category: "roof",
    categoryLabel: "屋頂防水",
    location: "彰化縣 員林市",
    year: "2023",
    summary:
      "連棟透天共用屋頂，需縮短工期減少住戶影響。清理整平後鋪設高分子自黏片材，接縫熱風焊接，周邊上返收邊。",
    beforeNote: "舊有瀝青防水層老化龜裂，多戶反映漏水。",
    afterNote: "自黏片材整面披覆，接縫焊接一體，施工 3 日完成。",
    highlights: ["高分子自黏片材", "接縫熱風焊接", "女兒牆上返收邊", "工期 3 日"],
  },
];

export const portfolioFilters: { value: ServiceSlug | "all"; label: string }[] = [
  { value: "all", label: "全部實績" },
  { value: "roof", label: "屋頂防水" },
  { value: "exterior-wall", label: "外牆防水" },
  { value: "bathroom", label: "浴廁防水" },
  { value: "basement", label: "地下室防水" },
  { value: "metal-roof", label: "鐵皮屋防水" },
];
