"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormShell } from "@/components/admin/form";
import { saveNav } from "./actions";

type Row = { id?: string; label: string; href: string };

export function NavForm({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rows, setRows] = useState<Row[]>(
    initial.length ? initial : [{ label: "", href: "" }],
  );

  const set = (i: number, key: "label" | "href", v: string) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, [key]: v } : x)));

  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const submit = () =>
    start(async () => {
      const res = await saveNav({ items: rows });
      if (res.ok) {
        toast.success("已儲存");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/content"
      submitLabel="儲存"
    >
      <p className="text-xs text-dim">
        「服務項目」下的子選單由已發佈的服務項目自動帶入，不需在這裡維護。
      </p>
      {rows.map((row, i) => (
        <div key={row.id ?? `new-${i}`} className="flex items-end gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              placeholder="顯示名稱"
              value={row.label}
              onChange={(e) => set(i, "label", e.target.value)}
            />
            <Input
              placeholder="連結（例：/about）"
              value={row.href}
              onChange={(e) => set(i, "href", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-dim hover:text-ink-800 disabled:opacity-30"
              aria-label="上移"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === rows.length - 1}
              className="text-dim hover:text-ink-800 disabled:opacity-30"
              aria-label="下移"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
              className="text-dim hover:text-destructive"
              aria-label="移除"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setRows((r) => [...r, { label: "", href: "" }])}
        >
          <Plus className="size-4" />
          新增項目
        </Button>
      </div>
    </FormShell>
  );
}
