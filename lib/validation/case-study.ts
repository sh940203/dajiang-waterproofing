import { z } from "zod";

const opt = (max: number) =>
  z.string().trim().max(max, "字數過長").optional().or(z.literal(""));

export const caseStudyScalarSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "請填 slug")
    .max(80, "字數過長")
    .regex(/^[a-z0-9-]+$/, "只能用小寫英數與連字號 -"),
  title: z.string().trim().min(1, "請填標題").max(80, "字數過長"),
  category: opt(60),
  location: opt(60),
  year: opt(20),
  summary: opt(600),
  beforeNote: opt(300),
  afterNote: opt(300),
  published: z.boolean(),
});

export const caseStudySchema = caseStudyScalarSchema.extend({
  highlights: z.array(z.string().trim().max(60)).default([]),
});

export type CaseStudyScalarInput = z.infer<typeof caseStudyScalarSchema>;
export type CaseStudyInput = z.infer<typeof caseStudySchema>;

export const casePhotoSchema = z.object({
  caption: opt(120),
});
