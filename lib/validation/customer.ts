import { z } from "zod";

const opt = (max: number) =>
  z.string().trim().max(max, "字數過長").optional().or(z.literal(""));

export const customerSchema = z.object({
  name: z.string().trim().min(1, "請填寫姓名").max(80, "字數過長"),
  phone: opt(40),
  email: z
    .union([z.literal(""), z.string().trim().email("Email 格式不正確").max(120)])
    .optional(),
  address: opt(200),
  source: opt(60),
  notes: opt(2000),
});

export type CustomerInput = z.infer<typeof customerSchema>;
