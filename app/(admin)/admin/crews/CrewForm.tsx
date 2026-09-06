"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormShell, Field } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  crewSchema,
  CREW_STATUS,
  crewStatusLabel,
  type CrewInput,
} from "@/lib/validation/crew";
import type { Crew } from "@/lib/db/schema";
import { createCrew, updateCrew, deleteCrew } from "./actions";

export function CrewForm({ initial }: { initial?: Crew }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CrewInput>({
    resolver: zodResolver(crewSchema),
    defaultValues: {
      name: initial?.name ?? "",
      phone: initial?.phone ?? "",
      specialty: initial?.specialty ?? "",
      status: initial?.status ?? "available",
      notes: initial?.notes ?? "",
    },
  });

  const submit = handleSubmit((values) => {
    start(async () => {
      const res = initial
        ? await updateCrew(initial.id, values)
        : await createCrew(values);
      if (res.ok) {
        toast.success(initial ? "已更新" : "已新增");
        router.push("/admin/crews");
      } else toast.error(res.error);
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/crews"
      submitLabel={initial ? "更新" : "新增"}
      extra={
        initial && (
          <DeleteButton
            onDelete={() => deleteCrew(initial.id)}
            redirectTo="/admin/crews"
          />
        )
      }
    >
      <Field label="姓名 / 工班名" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="電話" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register("phone")} />
        </Field>
        <Field label="狀態" htmlFor="status" error={errors.status?.message}>
          <select
            id="status"
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            {...register("status")}
          >
            {CREW_STATUS.map((s) => (
              <option key={s} value={s}>
                {crewStatusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label="專長類別"
        htmlFor="specialty"
        hint="例：PU 防水、外牆灌注、鐵皮"
        error={errors.specialty?.message}
      >
        <Input id="specialty" {...register("specialty")} />
      </Field>
      <Field label="備註" htmlFor="notes" error={errors.notes?.message}>
        <Textarea id="notes" rows={4} {...register("notes")} />
      </Field>
    </FormShell>
  );
}
