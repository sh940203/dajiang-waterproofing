import { z } from "zod";

const opt = (max: number) =>
  z.string().trim().max(max, "字數過長").optional().or(z.literal(""));

export const CREW_STATUS = ["available", "busy", "off"] as const;
export const crewStatusLabel: Record<(typeof CREW_STATUS)[number], string> = {
  available: "可派工",
  busy: "施工中",
  off: "休假 / 不可用",
};

export const crewSchema = z.object({
  name: z.string().trim().min(1, "請填寫姓名").max(80, "字數過長"),
  phone: opt(40),
  specialty: opt(120),
  status: z.enum(CREW_STATUS),
  notes: opt(2000),
});

export type CrewInput = z.infer<typeof crewSchema>;
