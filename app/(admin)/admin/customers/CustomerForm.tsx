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
import { customerSchema, type CustomerInput } from "@/lib/validation/customer";
import type { Customer } from "@/lib/db/schema";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./actions";

export function CustomerForm({ initial }: { initial?: Customer }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initial?.name ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      address: initial?.address ?? "",
      source: initial?.source ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const submit = handleSubmit((values) => {
    start(async () => {
      const res = initial
        ? await updateCustomer(initial.id, values)
        : await createCustomer(values);
      if (res.ok) {
        toast.success(initial ? "已更新" : "已新增");
        router.push("/admin/customers");
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/customers"
      submitLabel={initial ? "更新" : "新增"}
      extra={
        initial && (
          <DeleteButton
            onDelete={() => deleteCustomer(initial.id)}
            redirectTo="/admin/customers"
            description="刪除客戶不會連帶刪除其工程；工程的客戶欄位會清空。"
          />
        )
      }
    >
      <Field label="姓名" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="電話" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register("phone")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </Field>
      </div>
      <Field label="地址" htmlFor="address" error={errors.address?.message}>
        <Input id="address" {...register("address")} />
      </Field>
      <Field
        label="來源管道"
        htmlFor="source"
        hint="例：Google、朋友介紹、FB"
        error={errors.source?.message}
      >
        <Input id="source" {...register("source")} />
      </Field>
      <Field label="備註" htmlFor="notes" error={errors.notes?.message}>
        <Textarea id="notes" rows={4} {...register("notes")} />
      </Field>
    </FormShell>
  );
}
