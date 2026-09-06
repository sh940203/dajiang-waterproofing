import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  before?: string;
  after?: string;
  beforeNote?: string;
  afterNote?: string;
  className?: string;
};

/**
 * 施工前後對比 —— 左右並排。
 * 第一階段沒有真實照片，缺圖時以樣式化佔位呈現；
 * 第三階段接上 Cloudflare R2 的 before_image_url / after_image_url。
 */
export function BeforeAfter({
  before,
  after,
  beforeNote,
  afterNote,
  className,
}: Props) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <Panel label="施工前" tone="before" src={before} note={beforeNote} />
      <Panel label="施工後" tone="after" src={after} note={afterNote} />
    </div>
  );
}

function Panel({
  label,
  tone,
  src,
  note,
}: {
  label: string;
  tone: "before" | "after";
  src?: string;
  note?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-paper-100">
      <div className="relative aspect-[4/3]">
        {src ? (
          <Image
            src={src}
            alt={note ? `${label}：${note}` : label}
            fill
            sizes="(min-width: 640px) 24rem, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              tone === "before"
                ? "bg-paper-400/60 text-ink-600/60"
                : "bg-ink-50 text-ink-500/70",
            )}
          >
            <span className="text-xs tracking-widest">照片準備中</span>
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium",
            tone === "before"
              ? "bg-ink-900/70 text-paper-100"
              : "bg-seal-500 text-paper-50",
          )}
        >
          {label}
        </span>
      </div>
      {note && (
        <figcaption className="px-4 py-3 text-sm text-foreground/75">
          {note}
        </figcaption>
      )}
    </figure>
  );
}
