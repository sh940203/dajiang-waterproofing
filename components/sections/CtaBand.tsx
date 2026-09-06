import Link from "next/link";
import { getSite } from "@/lib/content/settings";

export async function CtaBand() {
  const site = await getSite();

  return (
    <section className="relative overflow-hidden bg-ink-800 text-paper-100">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-ink-700"
        viewBox="0 0 1200 128"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64 C180,110 360,20 560,56 C760,92 900,120 1080,88 C1140,77 1180,84 1200,80 L1200,128 L0,128 Z"
        />
      </svg>
      <div className="container-page relative py-16 text-center md:py-20">
        <h2 className="text-2xl text-paper-50 md:text-3xl">
          懷疑哪裡在漏水？先讓我們去看一眼
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-paper-200/80">
          填寫一次表單，附上照片與方便的勘驗時段，我們會回覆評估與大概方向。現場勘驗免費、不強迫施工。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/inquiry"
            className="rounded-full bg-seal-500 px-7 py-3.5 text-base font-medium text-paper-50 transition-colors hover:bg-seal-600"
          >
            預約免費勘驗
          </Link>
          <a
            href={site.phoneHref}
            className="rounded-full border border-paper-100/30 px-7 py-3.5 text-base font-medium text-paper-100 transition-colors hover:bg-paper-100/10"
          >
            直接來電 {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
