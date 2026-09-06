"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] 未預期錯誤：", error);
  }, [error]);

  const msg =
    error.message === "未登入"
      ? "登入階段已失效，請重新登入。"
      : error.message === "權限不足"
        ? "你沒有權限執行這個操作。"
        : "發生未預期的錯誤，請重試。";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-4xl font-bold text-ink-200">！</p>
      <h1 className="text-lg font-semibold text-ink-800">{msg}</h1>
      {error.digest && (
        <p className="text-xs text-dim">錯誤代碼：{error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          重試
        </Button>
        <Button asChild>
          <a href="/admin">回總覽</a>
        </Button>
      </div>
    </div>
  );
}
