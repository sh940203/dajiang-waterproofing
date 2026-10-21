import { SectionHeading } from "@/components/ui/SectionHeading";

const points = [
  {
    no: "01",
    title: "先場勘，再說明",
    desc: "師傅到現場先丈量實際坪數、拍照留存，把屋頂狀況看清楚，再向您說明做法。",
  },
  {
    no: "02",
    title: "材料與做法依現場調整",
    desc: "先抓漏、修補裂縫、清潔基面，再依屋頂狀況與需求搭配防水與隔熱材料，不是每個案子都用同一招。",
  },
  {
    no: "03",
    title: "有共識才施工",
    desc: "施工前與您確認範圍與做法，取得共識後才開始。",
  },
  {
    no: "04",
    title: "完工回報與保固書",
    desc: "完工後拍照回報，提供保固書，並清潔施工帶來的髒污。",
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
