import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  kicker,
  title,
  intro,
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {kicker && (
        <p className="mb-3 flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-ink-500 uppercase">
          {align === "center" && <span className="h-px w-6 bg-ink-300" />}
          {kicker}
          <span className="h-px w-6 bg-ink-300" />
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-[2.25rem] text-balance">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-foreground/80">
          {intro}
        </p>
      )}
    </div>
  );
}
