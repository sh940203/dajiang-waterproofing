import { z } from "zod";

const opt = (max: number) =>
  z.string().trim().max(max, "字數過長").optional().or(z.literal(""));

/** RHF 綁定的純量欄位（清單類欄位在表單元件用 local state 管理）*/
export const serviceScalarSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "請填 slug")
    .max(60, "字數過長")
    .regex(/^[a-z0-9-]+$/, "只能用小寫英數與連字號 -"),
  label: z.string().trim().min(1, "請填名稱").max(40, "字數過長"),
  short: opt(60),
  summary: opt(400),
  headline: opt(200),
  intro: opt(4000),
  materials: opt(4000),
  warranty: opt(600),
  published: z.boolean(),
});

export const serviceSchema = serviceScalarSchema.extend({
  symptoms: z.array(z.string().trim().max(300)).default([]),
  process: z
    .array(
      z.object({
        title: z.string().trim().max(60, "字數過長"),
        desc: z.string().trim().max(600, "字數過長"),
      }),
    )
    .default([]),
});

export type ServiceScalarInput = z.infer<typeof serviceScalarSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
