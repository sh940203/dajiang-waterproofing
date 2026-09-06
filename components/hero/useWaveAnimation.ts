"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * 英雄區大浪背景圖的動態。
 *
 * 入場淡入交給 CSS（[data-hero-fade]），JS 未執行時內容仍完整可見；
 * 背景圖靜止時本身就是一幅完整插畫，動畫只是讓它「活起來」。
 *
 * - 桌機：極緩慢的 ken-burns（推近 + 微幅平移，長週期來回）＋ 滾輪跟隨視差
 * - 手機：關閉 ken-burns（省電），僅保留輕微視差
 * - prefers-reduced-motion：完全靜止
 * - 離開視窗：暫停循環
 */
export function useWaveAnimation(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      const img = scope.querySelector<HTMLElement>("[data-wave-img]");
      const content = scope.querySelector<HTMLElement>("[data-hero-content]");
      if (!img) return;

      const mm = gsap.matchMedia();

      const build = (parallax: number, kenBurns: boolean) => {
        const loops: gsap.core.Animation[] = [];

        // 留一點放大量給位移與視差用（幅度收斂，避免拉糊）
        gsap.set(img, { scale: 1.06, transformOrigin: "70% 40%" });

        if (kenBurns) {
          loops.push(
            gsap.to(img, {
              scale: 1.11,
              xPercent: 1.6,
              yPercent: -1.2,
              duration: 24,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }),
          );
        }

        // 滾輪跟隨視差：背景圖上移得比頁面慢
        gsap.to(img, {
          yPercent: `-=${5 * parallax}`,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        // 文字內容隨滾動淡出、微微上移
        if (content) {
          gsap.to(content, {
            opacity: 0,
            y: -48,
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top top",
              end: "55% top",
              scrub: true,
            },
          });
        }

        // 離開視窗時暫停 ken-burns（省電）
        const io = new IntersectionObserver(
          ([entry]) => {
            loops.forEach((a) => (entry.isIntersecting ? a.resume() : a.pause()));
          },
          { threshold: 0 },
        );
        io.observe(scope);

        return () => {
          io.disconnect();
          loops.forEach((a) => a.kill());
        };
      };

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => build(1, true),
      );
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => build(0.5, false),
      );
    }, scope);

    return () => ctx.revert();
  }, [scopeRef]);
}
