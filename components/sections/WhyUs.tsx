import { SectionHeading } from "@/components/ui/SectionHeading";

const points = [
  {
    no: "01",
    title: "先判讀，再動工",
    desc: "漏水常常「看到的地方不是漏的地方」。我們從水痕回推路徑，必要時做水線測試，找到源頭才報價。",
  },
  {
    no: "02",
    title: "工法對症下藥",
    desc: "灌注、塗膜、片材、滲透結晶、導水 —— 依部位與滲漏型態選擇，不是每個案子都用同一招。",
  },
  {
    no: "03",
    title: "報價透明",
    desc: "材料、工項、面積、單價逐條列出，施工中若有追加會先說明，不做完才報數字。",
  },
  {
    no: "04",
    title: "蓄水測試驗收",
    desc: "完工不是收工。屋頂與浴室以蓄水測試確認無滲漏才交屋，並提供書面保固。",
  },
];

export function WhyUs() {
  return (
    <section className="bg-paper-100 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          kicker="為什麼選大江"
          title="把每一次施工，當成自己家在做"
        />
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {points.map((p) => (
            <div key={p.no} className="flex gap-5">
              <span className="font-serif text-2xl font-bold text-ink-200">
                {p.no}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink-800">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
