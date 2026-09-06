import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSite, contactReadyFrom } from "@/lib/content/settings";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const contactReady = contactReadyFrom(site);
  const channels = buildChannels(site, contactReady).filter((c) => c.ready);
  return {
    title: "聯絡我們",
    description: `聯絡${site.name}：${channels
      .map((c) => `${c.label} ${c.value}`)
      .join("、")}。服務範圍 ${site.serviceArea}。`,
  };
}

function buildChannels(
  site: Awaited<ReturnType<typeof getSite>>,
  contactReady: ReturnType<typeof contactReadyFrom>,
) {
  return [
    {
      key: "phone",
      label: "電話",
      value: site.phone,
      href: site.phoneHref,
      note: site.hours,
      ready: contactReady.phone,
    },
    {
      key: "line",
      label: "LINE",
      value: site.lineId,
      href: site.lineHref,
      note: "傳訊息描述狀況、附照片最快",
      ready: contactReady.line,
    },
    {
      key: "email",
      label: "Email",
      value: site.email,
      href: `mailto:${site.email}`,
      note: "非急件、需附大量資料時",
      ready: contactReady.email,
    },
  ];
}

export default async function ContactPage() {
  const site = await getSite();
  const contactReady = contactReadyFrom(site);
  const channels = buildChannels(site, contactReady).filter((c) => c.ready);
  const serviceAreas = site.serviceArea.split(/\s*·\s*/).filter(Boolean);

  return (
    <>
      <PageHeader
        title="聯絡我們"
        lead={`服務範圍：${site.serviceArea}。以下任一方式都可以，我們會盡快回覆。`}
        breadcrumbs={[{ label: "聯絡我們" }]}
      />

      <section className="container-page py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <div className="space-y-4">
              {channels.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  target={c.key === "line" ? "_blank" : undefined}
                  rel={c.key === "line" ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-paper-100 p-5 transition-colors hover:border-ink-300 hover:bg-paper-50"
                >
                  <div>
                    <p className="text-xs font-medium tracking-widest text-ink-500">
                      {c.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink-800">
                      {c.value}
                    </p>
                    <p className="mt-1 text-sm text-dim">{c.note}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden className="text-ink-400">
                    <path d="M3 8h9M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-paper-100 p-5">
              <h2 className="text-sm font-semibold tracking-widest text-ink-500">
                {contactReady.address ? "地址" : "據點"}
              </h2>
              {contactReady.address ? (
                <p className="mt-2 text-base text-foreground/85">{site.address}</p>
              ) : (
                <p className="mt-2 text-base text-foreground/85">
                  以電話與 LINE 聯繫為主，需要當面洽談再另約時間地點。
                </p>
              )}
              <p className="mt-1 text-sm text-dim">營業時間：{site.hours}</p>
            </div>

            <Link
              href="/inquiry"
              className="mt-8 inline-flex rounded-full bg-ink-800 px-7 py-3.5 text-base font-medium text-paper-100 transition-colors hover:bg-ink-700"
            >
              改用線上表單預約勘驗
            </Link>
          </div>

          {/* 服務範圍（有正式地址後可改回內嵌地圖） */}
          <div className="rounded-2xl border border-border bg-paper-100 p-6 md:p-8">
            <h2 className="text-sm font-semibold tracking-widest text-ink-500">
              服務範圍
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/80">
              以下區域提供<span className="font-medium text-ink-800">免費現場勘驗</span>，
              其他縣市可先來電或傳 LINE 詢問。
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {serviceAreas.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-2 rounded-xl border border-border bg-paper-50 px-4 py-3 text-sm font-medium text-ink-800"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="text-ink-500">
                    <path
                      d="M8 1.5c2.5 0 4.5 2 4.5 4.5 0 3.2-4.5 8-4.5 8S3.5 9.2 3.5 6C3.5 3.5 5.5 1.5 8 1.5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <circle cx="8" cy="6" r="1.6" fill="currentColor" />
                  </svg>
                  {area}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-dim">
              施工地點在跨縣市交界、離島或山區，請直接聯繫確認能否安排。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
