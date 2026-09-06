import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { OTHER_SERVICE_TYPE } from "@/lib/schemas";
import { getServices } from "@/lib/content/db";
import { getSite, contactReadyFrom } from "@/lib/content/settings";

export const metadata: Metadata = {
  title: "預約詢價",
  description:
    "填寫一次表單，附上照片與方便的勘驗時段，大江防水會回覆評估與大概方向。現場勘驗免費。",
};

const steps = [
  { title: "填寫表單", desc: "描述滲漏狀況，可附照片。" },
  { title: "回覆與約時間", desc: "我們評估後回電，約定現場勘驗時段。" },
  { title: "現場勘驗與報價", desc: "到場判讀漏水源頭，提供逐項報價。" },
  { title: "決定是否施工", desc: "報價由您評估，不強迫、不收勘驗費。" },
];

export default async function InquiryPage() {
  const [services, site] = await Promise.all([getServices(), getSite()]);
  const contactReady = contactReadyFrom(site);
  const serviceOptions = [...services.map((s) => s.label), OTHER_SERVICE_TYPE];

  return (
    <>
      <PageHeader
        title="預約免費勘驗 / 詢價"
        lead="一張表單就好。填得越清楚，我們越能先給你有用的初步判斷。"
        breadcrumbs={[{ label: "預約詢價" }]}
      />

      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div className="rounded-2xl border border-border bg-paper-100 p-6 md:p-8">
            <InquiryForm serviceOptions={serviceOptions} />
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-ink-800">流程</h2>
              <ol className="mt-4 space-y-4 border-l border-border pl-5">
                {steps.map((s, i) => (
                  <li key={s.title} className="relative">
                    <span className="absolute -left-[1.55rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-800 text-[0.65rem] font-medium text-paper-100 ring-4 ring-background">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-ink-800">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/70">{s.desc}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-ink-800 p-6 text-paper-100">
              <h2 className="text-base font-semibold">急件想直接聯絡？</h2>
              <ul className="mt-3 space-y-2 text-sm text-paper-200/85">
                <li>
                  電話：
                  <a href={site.phoneHref} className="underline-offset-2 hover:underline">
                    {site.phone}
                  </a>
                </li>
                {contactReady.line && (
                  <li>
                    LINE：
                    <a
                      href={site.lineHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:underline"
                    >
                      {site.lineId}
                    </a>
                  </li>
                )}
                <li>營業時間：{site.hours}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
