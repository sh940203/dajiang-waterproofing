import type { LucideProps } from "lucide-react";

/**
 * lucide v1 已移除品牌圖示，這裡用同樣的 24×24 線條規格自繪簡化版，
 * 介面與 LucideIcon 相容，可直接丟給 IconTile。
 */
function base({ size = 24, strokeWidth = 1.6, ...rest }: LucideProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function LineIcon(props: LucideProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4C7 4 3 7.2 3 11.2c0 3.5 3.1 6.4 7.3 7l-.3 2.3 3.4-2.2c4.4-.4 7.6-3.4 7.6-7.1C21 7.2 17 4 12 4Z" />
      <path d="M7.5 9.5v3h1.8M11 9.5v3M13.2 12.5v-3l2.3 3v-3" />
    </svg>
  );
}

export function FacebookIcon(props: LucideProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M13.5 21v-7.5h2.3l.4-2.7h-2.7V9.2c0-.8.3-1.4 1.4-1.4h1.4V5.5a14 14 0 0 0-2-.2c-2 0-3.4 1.2-3.4 3.5v2H8.6v2.7h2.3V21" />
    </svg>
  );
}

export function InstagramIcon(props: LucideProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  );
}
