import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/** 文字旁的小圖示方塊（與服務卡片的圖示同款），純裝飾，不進無障礙樹 */
export function IconTile({
  icon: Icon,
  size = "md",
  tone = "light",
  className,
}: {
  icon: ComponentType<LucideProps>;
  size?: "sm" | "md";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "md" ? "h-11 w-11 rounded-xl" : "h-9 w-9 rounded-lg",
        tone === "light" ? "bg-ink-50 text-ink-700" : "bg-paper-100/10 text-paper-100",
        className,
      )}
    >
      <Icon size={size === "md" ? 22 : 18} strokeWidth={1.6} />
    </span>
  );
}
