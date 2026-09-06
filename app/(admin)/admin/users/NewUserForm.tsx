"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FormShell, Field } from "@/components/admin/form";
import {
  createUserSchema,
  USER_ROLES,
  userRoleLabel,
  type CreateUserInput,
} from "@/lib/validation/user";
import { createUser } from "./actions";

const selectCls =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function NewUserForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: "", password: "", role: "editor" },
  });

  const submit = handleSubmit((values) => {
    start(async () => {
      const res = await createUser(values);
      if (res.ok) {
        toast.success("已建立");
        router.push("/admin/users");
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/users"
      submitLabel="建立"
    >
      <Field label="帳號" htmlFor="username" required error={errors.username?.message}>
        <Input id="username" autoComplete="off" {...register("username")} />
      </Field>
      <Field
        label="初始密碼"
        htmlFor="password"
        required
        hint="至少 8 個字，建立後請對方自行更換"
        error={errors.password?.message}
      >
        <Input id="password" type="text" autoComplete="off" {...register("password")} />
      </Field>
      <Field label="角色" htmlFor="role" error={errors.role?.message}>
        <select id="role" className={selectCls} {...register("role")}>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {userRoleLabel[r]}
            </option>
          ))}
        </select>
      </Field>
    </FormShell>
  );
}
