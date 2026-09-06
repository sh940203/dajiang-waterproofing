"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormShell({
  children,
  onSubmit,
  submitLabel = "儲存",
  cancelHref,
  pending,
  extra,
}: {
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  cancelHref: string;
  pending?: boolean;
  /** 左下角額外內容（例如刪除按鈕）*/
  extra?: ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-xl border border-border bg-card"
    >
      <div className="grid gap-5 p-6">{children}</div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
        <div>{extra}</div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" type="button">
            <Link href={cancelHref}>取消</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "儲存中…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
        {hint && <span className="ml-2 font-normal text-dim">{hint}</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
