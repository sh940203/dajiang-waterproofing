"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { moveCase } from "./actions";

export function ReorderRow({
  id,
  isFirst,
  isLast,
}: {
  id: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const go = (dir: "up" | "down") =>
    start(async () => {
      const res = await moveCase(id, dir);
      if (res.ok) router.refresh();
      else toast.error(res.error);
    });

  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={isFirst || pending}
        onClick={() => go("up")}
        className="text-dim hover:text-ink-800 disabled:opacity-30"
        aria-label="上移"
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        disabled={isLast || pending}
        onClick={() => go("down")}
        className="text-dim hover:text-ink-800 disabled:opacity-30"
        aria-label="下移"
      >
        <ArrowDown className="size-4" />
      </button>
    </div>
  );
}
