"use client";

import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, Field } from "@/components/admin/form";
import { SETTING_FIELDS, settingsSchema, type SettingsInput } from "@/lib/validation/settings";
import { saveSettings } from "./actions";

export function SettingsForm({
  initialValues,
  initialCoreValues,
}: {
  initialValues: Record<string, string>;
  initialCoreValues: { element: string; label: string; summary: string }[];
}) {
  const [pending, start] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      values: Object.fromEntries(
        SETTING_FIELDS.map((f) => [f.key, initialValues[f.key] ?? ""]),
      ),
      coreValues: initialCoreValues.length
        ? initialCoreValues
        : [{ element: "", label: "", summary: "" }],
    },
  });

  const core = useFieldArray({ control, name: "coreValues" });

  const submit = handleSubmit((data) => {
    start(async () => {
      const res = await saveSettings(data);
      if (res.ok) toast.success("已儲存");
      else toast.error(res.error);
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/content"
      submitLabel="儲存"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {SETTING_FIELDS.map((f) => (
          <Field
            key={f.key}
            label={f.label}
            htmlFor={f.key}
            hint={f.hint}
            className={f.type === "textarea" ? "sm:col-span-2" : undefined}
            error={errors.values?.[f.key]?.message}
          >
            {f.type === "textarea" ? (
              <Textarea id={f.key} rows={3} {...register(`values.${f.key}`)} />
            ) : (
              <Input id={f.key} {...register(`values.${f.key}`)} />
            )}
          </Field>
        ))}
      </div>

      <div className="mt-2 grid gap-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-800">
            風火水三大核心（首頁卡片）
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              core.append({ element: "", label: "", summary: "" })
            }
          >
            <Plus className="size-4" />
            新增
          </Button>
        </div>
        {core.fields.map((row, i) => (
          <div
            key={row.id}
            className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[4rem_1fr_auto]"
          >
            <Input
              placeholder="元素"
              {...register(`coreValues.${i}.element`)}
            />
            <div className="grid gap-2">
              <Input
                placeholder="標題（例：精準防水）"
                {...register(`coreValues.${i}.label`)}
              />
              <Textarea
                rows={2}
                placeholder="說明"
                {...register(`coreValues.${i}.summary`)}
              />
            </div>
            <button
              type="button"
              onClick={() => core.remove(i)}
              className="self-start text-dim hover:text-destructive"
              aria-label="移除"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {errors.coreValues?.message && (
          <p className="text-xs text-destructive">
            {errors.coreValues.message}
          </p>
        )}
      </div>
    </FormShell>
  );
}
