"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FormShell, Field } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { materialSchema, type MaterialInput } from "@/lib/validation/material";
import type { Material } from "@/lib/db/schema";
import { createMaterial, updateMaterial, deleteMaterial } from "./actions";

export function MaterialForm({ initial }: { initial?: Material }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialInput>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: initial?.name ?? "",
      spec: initial?.spec ?? "",
      unit: initial?.unit ?? "",
      unitPrice: initial?.unitPrice != null ? String(initial.unitPrice) : "",
      supplier: initial?.supplier ?? "",
      stockQty: initial?.stockQty != null ? String(initial.stockQty) : "",
    },
  });

  const submit = handleSubmit((values) => {
    start(async () => {
      const res = initial
        ? await updateMaterial(initial.id, values)
        : await createMaterial(values);
      if (res.ok) {
        toast.success(initial ? "已更新" : "已新增");
        router.push("/admin/materials");
      } else toast.error(res.error);
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/materials"
      submitLabel={initial ? "更新" : "新增"}
      extra={
        initial && (
          <DeleteButton
            onDelete={() => deleteMaterial(initial.id)}
            redirectTo="/admin/materials"
          />
        )
      }
    >
      <Field label="名稱" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="規格" htmlFor="spec" error={errors.spec?.message}>
          <Input id="spec" {...register("spec")} />
        </Field>
        <Field label="單位" htmlFor="unit" hint="例：桶、公斤、m²" error={errors.unit?.message}>
          <Input id="unit" {...register("unit")} />
        </Field>
        <Field label="單價" htmlFor="unitPrice" error={errors.unitPrice?.message}>
          <Input id="unitPrice" type="number" step="0.01" min="0" {...register("unitPrice")} />
        </Field>
        <Field label="庫存量" htmlFor="stockQty" hint="選填" error={errors.stockQty?.message}>
          <Input id="stockQty" type="number" step="0.01" min="0" {...register("stockQty")} />
        </Field>
      </div>
      <Field label="供應商" htmlFor="supplier" error={errors.supplier?.message}>
        <Input id="supplier" {...register("supplier")} />
      </Field>
    </FormShell>
  );
}
