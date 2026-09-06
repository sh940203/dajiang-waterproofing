"use client";

import { useRef, Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { WaveLayers } from "@/components/hero/WaveLayers";
import { useWaveAnimation } from "@/components/hero/useWaveAnimation";

export type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  assurances: string[];
};

/** 入場動畫的逐項延遲 */
const delay = (i: number): CSSProperties =>
  ({ "--hero-delay": `${0.1 + i * 0.1}s` }) as CSSProperties;

export function WaveHero({ content }: { content: HeroContent }) {
  const ref = useRef<HTMLElement>(null);
  useWaveAnimation(ref);

  const titleLines = content.title.split("\n");

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[92vh] flex-col overflow-hidden bg-gradient-to-b from-paper-100 to-paper-200"
    >
      {/* 浮世繪大浪背景（Hokusai《神奈川沖浪裏》· CC0 · 已調色） */}
      <WaveLayers />

      {/* 文字安全區柔光罩：左側維持不透明蓋住浪紋，往右淡出 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(102deg, var(--color-paper-100) 0%, var(--color-paper-100) 30%, color-mix(in srgb, var(--color-paper-100) 74%, transparent) 48%, transparent 74%)",
        }}
      />
      {/* 底部再壓一道，銜接下一段 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-paper-200 to-transparent"
      />

      <div
        data-hero-content
        className="container-page relative z-10 flex flex-1 flex-col justify-start pt-24 pb-[56vh] md:pt-36 md:pb-24"
      >
        <p
          data-hero-fade
          style={delay(0)}
          className="mb-5 flex items-center gap-2.5 text-sm font-medium tracking-[0.25em] text-ink-600"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-seal-500" />
          {content.badge}
        </p>

        <h1
          data-hero-fade
          style={delay(1)}
          className="max-w-[38rem] text-[2.1rem] leading-[1.28] text-balance sm:text-5xl sm:leading-[1.22] md:text-[3.4rem]"
        >
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h1>

        <p
          data-hero-fade
          style={delay(2)}
          className="mt-6 max-w-md text-base leading-relaxed text-foreground/80 md:text-lg"
        >
          {content.subtitle}
        </p>

        <div
          data-hero-fade
          style={delay(3)}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/inquiry"
            className="rounded-full bg-ink-800 px-7 py-3.5 text-base font-medium text-paper-100 shadow-lg shadow-ink-900/10 transition-colors hover:bg-ink-700"
          >
            {content.primaryCtaLabel}
          </Link>
          <Link
            href="/portfolio"
            className="rounded-full border border-ink-800/30 bg-paper-100/70 px-7 py-3.5 text-base font-medium text-ink-800 backdrop-blur-sm transition-colors hover:border-ink-800 hover:bg-paper-100"
          >
            {content.secondaryCtaLabel}
          </Link>
        </div>

        <ul
          data-hero-fade
          style={delay(4)}
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700"
        >
          {content.assurances.map((a) => (
            <li key={a} className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path
                  d="M2 7.5 5.5 11 12 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* 向下捲動提示 */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-[0.3em] text-paper-100/80 mix-blend-plus-lighter">
        <span>SCROLL</span>
        <span className="h-8 w-px animate-pulse bg-paper-100/50" />
      </div>
    </section>
  );
}
