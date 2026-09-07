"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 英雄區背景：葛飾北齋《神奈川沖浪裏》(Met Open Access / CC0)，
 * 已調色到品牌藍調、水平翻轉（大浪在右，左側留給文字）、裁掉題款與落款。
 * 動態（緩慢 ken-burns + 滾輪視差 + 離開視窗暫停 + reduced-motion 靜止）在 useWaveAnimation。
 *
 * - 桌機：滿版裁切，視點偏右上對準大浪。
 * - 手機：整幅縮成底部一條帶，文字在上方乾淨區。
 */

// 極小的模糊底圖，讓大圖載入前先有畫面、避免閃白
const LQIP =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARQXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAQABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDp0ZRg7xTbksyHawHFc+Jcxqrb19OeRTXmaOVQzuy+nrVWJuT6deSxzSfaZgVBOBRS3JspIBJINuPSiiwH/9k=";

export function WaveLayers({ className }: { className?: string }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden",
        isMobile ? "top-[46%]" : "top-0",
        className,
      )}
      aria-hidden
    >
      {/* 手機：浪帶上緣柔化，銜接上方文字區 */}
      {isMobile && (
        <div className="absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-paper-200 to-transparent" />
      )}
      {/* images.unoptimized 下 next/image 無最佳化效益，直接用 <img> + srcset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-wave-img
        src="/brand/great-wave.jpg"
        srcSet="/brand/great-wave-1400.jpg 1400w, /brand/great-wave.jpg 2200w"
        sizes="100vw"
        alt=""
        width={2200}
        height={1479}
        decoding="async"
        loading="eager"
        fetchPriority="high"
        className={cn(
          // 不加 will-change：避免瀏覽器把大圖預先低解析度 rasterize 後被 scale 拉糊
          "absolute inset-0 h-full w-full object-cover",
          isMobile ? "object-[60%_16%]" : "object-[88%_26%]",
        )}
        style={{
          backgroundColor: "#e4ebef",
          backgroundImage: `url("${LQIP}")`,
          backgroundSize: "cover",
          backgroundPosition: isMobile ? "60% 16%" : "88% 26%",
        }}
      />
    </div>
  );
}
