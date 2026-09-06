"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, Field } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  caseStudyScalarSchema,
  type CaseStudyScalarInput,
} from "@/lib/validation/case-study";
import type { CaseStudy } from "@/lib/db/schema";
import { createCase, updateCase, deleteCase } from "./actions";

const selectCls =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function CaseForm({
  initial,
  serviceOptions,
}: {
  initial?: CaseStudy;
  serviceOptions: { slug: string; label: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseStudyScalarInput>({
    resolver: zodResolver(caseStudyScalarSchema),
    defaultValues: {
      slug: initial?.slug ?? "",
      title: initial?.title ?? "",
      category: initial?.category ?? "",
      location: initial?.location ?? "",
      year: initial?.year ?? "",
      summary: initial?.summary ?? "",
      beforeNote: initial?.beforeNote ?? "",
      afterNote: initial?.afterNote ?? "",
      published: initial?.published ?? true,
    },
  });

  const [highlights, setHighlights] = useState<string[]>(
    initial?.highlights ?? [],
  );

  const submit = handleSubmit((values) => {
    start(async () => {
      const payload = {
        ...values,
        highlights: highlights.map((x) => x.trim()).filter(Boolean),
      };
      const res = initial
        ? await updateCase(initial.id, payload)
        : await createCase(payload);
      if (res.ok) {
        toast.success(initial ? "已更新" : "已新增");
        router.push(
          initial ? "/admin/content/cases" : `/admin/content/cases/${res.id}`,
        );
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/content/cases"
      submitLabel={initial ? "更新" : "新增"}
      extra={
        initial && (
          <DeleteButton
            onDelete={() => deleteCase(initial.id)}
            redirectTo="/admin/content/cases"
            description="會一併刪除此案例的施工前後照片，且無法復原。"
          />
        )
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="slug" htmlFor="slug" required hint="網址用" error={errors.slug?.message}>
          <Input id="slug" {...register("slug")} />
        </Field>
        <Field label="標題" htmlFor="title" required error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <Field label="服務分類" htmlFor="category" error={errors.category?.message}>
          <select id="category" className={selectCls} {...register("category")}>
            <option value="">未分類</option>
            {serviceOptions.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="地點" htmlFor="location" error={errors.location?.message}>
          <Input id="location" {...register("location")} />
        </Field>
        <Field label="年份" htmlFor="year" error={errors.year?.message}>
          <Input id="year" {...register("year")} />
        </Field>
      </div>

      <Field label="案例摘要" htmlFor="summary" error={errors.summary?.message}>
        <Textarea id="summary" rows={3} {...register("summary")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="施工前說明" htmlFor="beforeNote" error={errors.beforeNote?.message}>
          <Textarea id="beforeNote" rows={2} {...register("beforeNote")} />
        </Field>
        <Field label="施工後說明" htmlFor="afterNote" error={errors.afterNote?.message}>
          <Textarea id="afterNote" rows={2} {...register("afterNote")} />
        </Field>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-800">施工重點</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setHighlights((h) => [...h, ""])}
          >
            <Plus className="size-4" />
            新增
          </Button>
        </div>
        {highlights.length === 0 && <p className="text-xs text-dim">尚無項目</p>}
        {highlights.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={val}
              onChange={(e) =>
                setHighlights((h) =>
                  h.map((x, j) => (j === i ? e.target.value : x)),
                )
              }
            />
            <button
              type="button"
              onClick={() => setHighlights((h) => h.filter((_, j) => j !== i))}
              className="text-dim hover:text-destructive"
              aria-label="移除"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-800">
        <input type="checkbox" {...register("published")} className="size-4" />
        發佈（前台顯示）
      </label>

      {!initial && (
        <p className="text-xs text-dim">建立後即可在編輯頁上傳施工前後照片。</p>
      )}
    </FormShell>
  );
}
