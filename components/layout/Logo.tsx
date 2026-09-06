import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logoSrc from "@/public/brand/logo.jpg";

type Props = {
  /** 公司名稱（alt text / 文字商標） */
  name: string;
  /** 英文名 / 標語（文字商標第二行） */
  nameEn?: string;
  /** 標誌圓徽的像素尺寸 */
  size?: number;
  /** 是否顯示旁邊的文字商標 */
  withWordmark?: boolean;
  /** 文字顏色走淺色（深底時使用） */
  light?: boolean;
  className?: string;
};

export function Logo({
  name,
  nameEn,
  size = 44,
  withWordmark = true,
  light = false,
  className,
}: Props) {
  return (
    <Link
      href="/"
      aria-label={`${name} 首頁`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className="relative shrink-0 overflow-hidden rounded-full ring-1 ring-ink-800/10"
        style={{ width: size, height: size }}
      >
        {/* Logo 本身為圓形構圖、邊緣留白，放大一點讓藍色圓框貼齊圓徽邊緣 */}
        <Image
          src={logoSrc}
          alt={`${name} 標誌`}
          fill
          sizes={`${size}px`}
          className="scale-[1.14] object-cover"
          priority
        />
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-serif text-lg font-bold tracking-wide",
              light ? "text-paper-100" : "text-ink-800",
            )}
          >
            {name}
          </span>
          {nameEn && (
            <span
              className={cn(
                "mt-1 text-[0.65rem] tracking-[0.28em]",
                light ? "text-paper-100/70" : "text-ink-500",
              )}
            >
              {nameEn}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
