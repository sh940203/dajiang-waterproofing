"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border bg-paper-50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-dim/70 focus:border-ink-600";

export function InquiryForm({ serviceOptions }: { serviceOptions: string[] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { serviceType: "" },
  });

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");

  const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
  const MAX_BYTES = 6 * 1024 * 1024;
  const MAX_FILES = 6;

  const addFiles = (list: FileList | null) => {
    const incoming = Array.from(list ?? []);
    if (incoming.length === 0) return;
    const merged = [...files];
    for (const f of incoming) {
      if (!ACCEPT.includes(f.type)) {
        setFileError("僅接受 JPG / PNG / WebP 圖片");
        return;
      }
      if (f.size > MAX_BYTES) {
        setFileError(`「${f.name}」超過 6MB，請壓縮後再上傳`);
        return;
      }
      if (merged.length >= MAX_FILES) {
        setFileError(`最多 ${MAX_FILES} 張`);
        break;
      }
      if (!merged.some((m) => m.name === f.name && m.size === f.size)) {
        merged.push(f);
      }
    }
    setFileError("");
    setFiles(merged);
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (values: InquiryInput) => {
    setStatus("idle");
    setServerMsg("");
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(values)) {
        if (v != null && v !== "") fd.append(k, String(v));
      }
      for (const f of files) fd.append("photos", f);

      const res = await fetch("/api/inquiry", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setServerMsg(data.message ?? "送出失敗，請稍後再試或直接來電。");
        return;
      }
      setStatus("success");
      setServerMsg(data.message ?? "已收到您的詢問，我們會盡快與您聯繫。");
      reset();
      setFiles([]);
      setFileError("");
    } catch {
      setStatus("error");
      setServerMsg("網路連線異常，請稍後再試或直接來電。");
    }
  };

  const totalMB = (files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1);

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-paper-100">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path d="M4 12.5 9 17.5 20 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-800">已送出</h3>
        <p className="mt-2 text-sm text-foreground/75">{serverMsg}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-ink-800/25 px-5 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-50"
        >
          再填一筆
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* 蜜罐 */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        {...register("company")}
      />

      <Field label="稱呼" required error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          placeholder="王先生 / 陳小姐"
          className={cn(fieldBase, errors.name ? "border-seal-500" : "border-border")}
          {...register("name")}
        />
      </Field>

      <Field
        label="聯絡方式"
        required
        hint="電話、LINE ID 或 Email 擇一"
        error={errors.contact?.message}
      >
        <input
          type="text"
          placeholder="0912-345-678 或 LINE：yourid"
          className={cn(fieldBase, errors.contact ? "border-seal-500" : "border-border")}
          {...register("contact")}
        />
      </Field>

      <Field
        label="施工地點"
        required
        hint="縣市 / 行政區即可，詳細地址勘驗前再提供"
        error={errors.address?.message}
      >
        <input
          type="text"
          placeholder="台中市西屯區"
          className={cn(fieldBase, errors.address ? "border-seal-500" : "border-border")}
          {...register("address")}
        />
      </Field>

      <Field label="防水類型" required error={errors.serviceType?.message}>
        <select
          defaultValue=""
          className={cn(
            fieldBase,
            "appearance-none",
            errors.serviceType ? "border-seal-500" : "border-border",
          )}
          {...register("serviceType")}
        >
          <option value="" disabled>
            請選擇
          </option>
          {serviceOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field label="方便勘驗時段" hint="選填" error={errors.preferredTime?.message}>
        <input
          type="text"
          placeholder="平日下午、週六上午…"
          className={cn(fieldBase, "border-border")}
          {...register("preferredTime")}
        />
      </Field>

      <Field
        label="滲漏狀況描述"
        required
        hint="漏水位置、何時開始、下雨才漏還是持續漏…"
        error={errors.description?.message}
      >
        <textarea
          rows={5}
          placeholder="例：三樓浴室天花板從上個月開始滴水，樓上是主臥浴室，磁磚看起來完好。"
          className={cn(
            fieldBase,
            "resize-y",
            errors.description ? "border-seal-500" : "border-border",
          )}
          {...register("description")}
        />
      </Field>

      <Field
        label="現場照片"
        hint={`選填，最多 ${MAX_FILES} 張，JPG / PNG / WebP，單張 6MB 內`}
        error={fileError}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-sm text-dim file:mr-4 file:rounded-full file:border-0 file:bg-ink-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink-700 hover:file:bg-ink-100"
        />
        {files.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-paper-50 px-3 py-2 text-xs"
              >
                <span className="truncate text-foreground/80">{f.name}</span>
                <span className="flex shrink-0 items-center gap-3 text-dim">
                  {(f.size / 1024 / 1024).toFixed(1)}MB
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-dim hover:text-seal-600"
                    aria-label={`移除 ${f.name}`}
                  >
                    移除
                  </button>
                </span>
              </li>
            ))}
            <li className="pt-0.5 text-right text-xs text-dim">
              共 {files.length} 張 · {totalMB}MB
            </li>
          </ul>
        )}
      </Field>

      {status === "error" && (
        <p className="rounded-xl border border-seal-500/40 bg-seal-500/5 px-4 py-3 text-sm text-seal-600">
          {serverMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-ink-800 px-6 py-3.5 text-base font-medium text-paper-100 transition-colors hover:bg-ink-700 disabled:opacity-60"
      >
        {isSubmitting ? "送出中…" : "送出詢問"}
      </button>
      <p className="text-center text-xs text-dim">
        送出即表示同意大江防水以您提供的聯絡方式回覆此次詢問。
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-medium text-ink-800">
          {label}
          {required && <span className="ml-0.5 text-seal-500">*</span>}
        </span>
        {hint && <span className="text-xs text-dim">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-seal-600">{error}</span>}
    </label>
  );
}
