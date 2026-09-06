import { z } from "zod";
import { PROJECT_STATUSES } from "@/lib/db/schema";

export { PROJECT_STATUSES };

const opt = (max: number) =>
  z.string().trim().max(max, "字數過長").optional().or(z.literal(""));

const dateStr = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式需為 YYYY-MM-DD")
  .optional()
  .or(z.literal(""));

/** RHF 只綁定純量欄位，關聯（工班／物料）在表單元件用 local state 管理 */
export const projectScalarSchema = z.object({
  title: z.string().trim().min(1, "請填寫工程名稱").max(120, "字數過長"),
  customerId: z.string().trim().optional().or(z.literal("")),
  address: opt(200),
  status: z.enum(PROJECT_STATUSES),
  startDate: dateStr,
  endDate: dateStr,
  notes: opt(4000),
});

export const projectCrewSchema = z.object({
  crewId: z.string().min(1, "請選擇工班"),
  role: z.string().trim().max(60, "字數過長").optional().or(z.literal("")),
});

const qty = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "用量需為 0 以上的數字",
  )
  .optional()
  .or(z.literal(""));

export const projectMaterialSchema = z.object({
  materialId: z.string().min(1, "請選擇物料"),
  quantity: qty,
});

export const projectSchema = projectScalarSchema
  .extend({
    crews: z.array(projectCrewSchema).default([]),
    materials: z.array(projectMaterialSchema).default([]),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.endDate && v.startDate > v.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "結束日期不能早於開始日期",
        path: ["endDate"],
      });
    }
  });

export type ProjectScalarInput = z.infer<typeof projectScalarSchema>;
export type ProjectCrewInput = z.infer<typeof projectCrewSchema>;
export type ProjectMaterialInput = z.infer<typeof projectMaterialSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
