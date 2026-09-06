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
import { Combobox } from "@/components/admin/Combobox";
import {
  projectScalarSchema,
  PROJECT_STATUSES,
  type ProjectScalarInput,
} from "@/lib/validation/project";
import { createProject, updateProject, deleteProject } from "./actions";

type Opt = { id: string; name: string; hint?: string };

export type ProjectFormInitial = {
  id: string;
  title: string;
  customerId: string | null;
  address: string | null;
  status: (typeof PROJECT_STATUSES)[number];
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  crews: { crewId: string; role: string | null }[];
  materials: { materialId: string; quantity: number | null }[];
};

const selectCls =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ProjectForm({
  initial,
  customers,
  crews,
  materials,
}: {
  initial?: ProjectFormInitial;
  customers: Opt[];
  crews: Opt[];
  materials: Opt[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectScalarInput>({
    resolver: zodResolver(projectScalarSchema),
    defaultValues: {
      title: initial?.title ?? "",
      customerId: initial?.customerId ?? "",
      address: initial?.address ?? "",
      status: initial?.status ?? "勘驗",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [crewRows, setCrewRows] = useState<{ crewId: string; role: string }[]>(
    initial?.crews.map((c) => ({ crewId: c.crewId, role: c.role ?? "" })) ?? [],
  );
  const [matRows, setMatRows] = useState<
    { materialId: string; quantity: string }[]
  >(
    initial?.materials.map((m) => ({
      materialId: m.materialId,
      quantity: m.quantity != null ? String(m.quantity) : "",
    })) ?? [],
  );

  const submit = handleSubmit((values) => {
    const payload = {
      ...values,
      customerId,
      crews: crewRows.filter((c) => c.crewId),
      materials: matRows.filter((m) => m.materialId),
    };
    start(async () => {
      const res = initial
        ? await updateProject(initial.id, payload)
        : await createProject(payload);
      if (res.ok) {
        toast.success(initial ? "已更新" : "已新增");
        router.push(`/admin/projects/${res.id}`);
      } else {
        toast.error(res.error);
      }
    });
  });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/projects"
      submitLabel={initial ? "更新" : "新增"}
      extra={
        initial && (
          <DeleteButton
            onDelete={() => deleteProject(initial.id)}
            redirectTo="/admin/projects"
            description="刪除工程會一併移除其工班／物料關聯，且無法復原。"
          />
        )
      }
    >
      <Field
        label="工程名稱"
        htmlFor="title"
        required
        error={errors.title?.message}
      >
        <Input id="title" {...register("title")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="客戶" htmlFor="customerId">
          <Combobox
            id="customerId"
            options={customers.map((c) => ({
              value: c.id,
              label: c.name,
              hint: c.hint,
            }))}
            value={customerId}
            onChange={setCustomerId}
            placeholder="搜尋客戶姓名 / 電話"
            emptyLabel="查無客戶，請先到「客戶」建立"
          />
        </Field>
        <Field label="狀態" htmlFor="status" error={errors.status?.message}>
          <select id="status" className={selectCls} {...register("status")}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="工程地址" htmlFor="address" error={errors.address?.message}>
        <Input id="address" {...register("address")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="開始日期"
          htmlFor="startDate"
          hint="YYYY-MM-DD"
          error={errors.startDate?.message}
        >
          <Input id="startDate" type="date" {...register("startDate")} />
        </Field>
        <Field
          label="結束日期"
          htmlFor="endDate"
          hint="YYYY-MM-DD"
          error={errors.endDate?.message}
        >
          <Input id="endDate" type="date" {...register("endDate")} />
        </Field>
      </div>

      {/* 工班關聯 */}
      <div className="grid gap-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-800">派工工班</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setCrewRows((r) => [...r, { crewId: "", role: "" }])
            }
          >
            <Plus className="size-4" />
            新增
          </Button>
        </div>
        {crewRows.length === 0 ? (
          <p className="text-xs text-dim">尚未指派工班</p>
        ) : (
          crewRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className={selectCls + " min-w-0 flex-1"}
                value={row.crewId}
                onChange={(e) =>
                  setCrewRows((r) =>
                    r.map((x, j) =>
                      j === i ? { ...x, crewId: e.target.value } : x,
                    ),
                  )
                }
              >
                <option value="">選擇工班…</option>
                {crews.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.hint ? `（${c.hint}）` : ""}
                  </option>
                ))}
              </select>
              <Input
                className="w-32"
                placeholder="角色 / 分工"
                value={row.role}
                onChange={(e) =>
                  setCrewRows((r) =>
                    r.map((x, j) =>
                      j === i ? { ...x, role: e.target.value } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                onClick={() =>
                  setCrewRows((r) => r.filter((_, j) => j !== i))
                }
                className="text-dim hover:text-destructive"
                aria-label="移除"
              >
                <X className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 物料關聯 */}
      <div className="grid gap-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-800">使用物料</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setMatRows((r) => [...r, { materialId: "", quantity: "" }])
            }
          >
            <Plus className="size-4" />
            新增
          </Button>
        </div>
        {matRows.length === 0 ? (
          <p className="text-xs text-dim">尚未登錄物料</p>
        ) : (
          matRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className={selectCls + " min-w-0 flex-1"}
                value={row.materialId}
                onChange={(e) =>
                  setMatRows((r) =>
                    r.map((x, j) =>
                      j === i ? { ...x, materialId: e.target.value } : x,
                    ),
                  )
                }
              >
                <option value="">選擇物料…</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.hint ? `（${m.hint}）` : ""}
                  </option>
                ))}
              </select>
              <Input
                className="w-28"
                type="number"
                step="0.01"
                min="0"
                placeholder="用量"
                value={row.quantity}
                onChange={(e) =>
                  setMatRows((r) =>
                    r.map((x, j) =>
                      j === i ? { ...x, quantity: e.target.value } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                onClick={() => setMatRows((r) => r.filter((_, j) => j !== i))}
                className="text-dim hover:text-destructive"
                aria-label="移除"
              >
                <X className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <Field label="備註" htmlFor="notes" error={errors.notes?.message}>
        <Textarea id="notes" rows={4} {...register("notes")} />
      </Field>
    </FormShell>
  );
}
