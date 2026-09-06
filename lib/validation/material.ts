import { z } from "zod";

const opt = (max: number) =>
  z.string().trim().max(max, "字數過長").optional().or(z.literal(""));

// 表單以字串處理數字欄位（<input type=number> 給的是字串）；action 再轉成 number|null
const optNumStr = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "請填數字（不可為負）",
  )
  .optional()
  .or(z.literal(""));

export const materialSchema = z.object({
  name: z.string().trim().min(1, "請填寫名稱").max(120, "字數過長"),
  spec: opt(120),
  unit: opt(20),
  unitPrice: optNumStr,
  supplier: opt(120),
  stockQty: optNumStr,
});

export type MaterialInput = z.infer<typeof materialSchema>;
