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
  serviceScalarSchema,
  type ServiceScalarInput,
} from "@/lib/validation/service";
import type { Service } from "@/lib/db/schema";
import { createService, updateService, deleteService } from "./actions";

export function ServiceForm({ initial }: { initial?: Service }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceScalarInput>({
    resolver: zodResolver(serviceScalarSchema),
    defaultValues: {
      slug: initial?.slug ?? "",
      label: initial?.label ?? "",
      short: initial?.short ?? "",
      summary: initial?.summary ?? "",
      headline: initial?.headline ?? "",
      intro: initial?.intro ?? "",
      materials: initial?.materials ?? "",
      warranty: initial?.warranty ?? "",
      published: initial?.published ?? true,
    },
  });

  const [symptoms, setSymptoms] = useState<string[]>(
    initial?.symptoms ?? [],
  );
  const [process, setProcess] = useState<{ title: string; desc: string }[]>(
    initial?.process ?? [],
  );

  const submit = handleSubmit((values) => {
    start(async () => {
      const payload = {
        ...values,
        symptoms: symptoms.filter((x) => x.trim()),
        process: process.filter((p) => p.title.trim() || p.desc.trim()),
      };
      const res = initial
        ? await updateService(initial.id, payload)
        : await createService(payload);
      if (res.ok) {
        toast.success(initial ? "已更新" : "已新增");
        router.push("/admin/content/services");
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/content/services"
      submitLabel={initial ? "更新" : "新增"}
      extra={
        initial && (
          <DeleteButton
            onDelete={() => deleteService(initial.id)}
            redirectTo="/admin/content/services"
            description="刪除後前台服務頁與導覽子選單會少一項，且無法復原。"
          />
        )
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="slug" htmlFor="slug" required hint="網址用，例：roof" error={errors.slug?.message}>
          <Input id="slug" {...register("slug")} />
        </Field>
        <Field label="名稱" htmlFor="label" required error={errors.label?.message}>
          <Input id="label" {...register("label")} />
        </Field>
      </div>

      <Field label="導覽短描述" htmlFor="short" hint="下拉選單用" error={errors.short?.message}>
        <Input id="short" {...register("short")} />
      </Field>
      <Field label="卡片摘要" htmlFor="summary" error={errors.summary?.message}>
        <Textarea id="summary" rows={2} {...register("summary")} />
      </Field>
      <Field label="服務頁標題" htmlFor="headline" error={errors.headline?.message}>
        <Textarea id="headline" rows={2} {...register("headline")} />
      </Field>
      <Field label="服務頁前言" htmlFor="intro" error={errors.intro?.message}>
        <Textarea id="intro" rows={4} {...register("intro")} />
      </Field>

      {/* 常見徵兆 */}
      <ListEditor
        label="常見滲漏徵兆"
        items={symptoms}
        onAdd={() => setSymptoms((s) => [...s, ""])}
        onRemove={(i) => setSymptoms((s) => s.filter((_, j) => j !== i))}
        render={(val, i) => (
          <Textarea
            rows={2}
            value={val}
            onChange={(e) =>
              setSymptoms((s) => s.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
        )}
      />

      {/* 施工流程 */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-800">施工流程</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setProcess((p) => [...p, { title: "", desc: "" }])}
          >
            <Plus className="size-4" />
            新增步驟
          </Button>
        </div>
        {process.map((row, i) => (
          <div key={i} className="grid gap-2 rounded-md border border-border p-3">
            <Input
              placeholder="步驟名稱"
              value={row.title}
              onChange={(e) =>
                setProcess((p) =>
                  p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                )
              }
            />
            <Textarea
              rows={2}
              placeholder="步驟說明"
              value={row.desc}
              onChange={(e) =>
                setProcess((p) =>
                  p.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)),
                )
              }
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setProcess((p) => p.filter((_, j) => j !== i))}
                className="text-xs text-dim hover:text-destructive"
              >
                移除步驟
              </button>
            </div>
          </div>
        ))}
      </div>

      <Field label="材料與工法" htmlFor="materials" error={errors.materials?.message}>
        <Textarea id="materials" rows={3} {...register("materials")} />
      </Field>
      <Field label="保固" htmlFor="warranty" error={errors.warranty?.message}>
        <Textarea id="warranty" rows={2} {...register("warranty")} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-800">
        <input type="checkbox" {...register("published")} className="size-4" />
        發佈（前台顯示）
      </label>
    </FormShell>
  );
}

function ListEditor({
  label,
  items,
  onAdd,
  onRemove,
  render,
}: {
  label: string;
  items: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (val: string, i: number) => React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-800">{label}</span>
        <Button type="button" size="sm" variant="ghost" onClick={onAdd}>
          <Plus className="size-4" />
          新增
        </Button>
      </div>
      {items.length === 0 && <p className="text-xs text-dim">尚無項目</p>}
      {items.map((val, i) => (
        <div key={i} className="flex items-start gap-2">
          {render(val, i)}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="mt-2 text-dim hover:text-destructive"
            aria-label="移除"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
