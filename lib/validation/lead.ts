import { z } from "zod";
import { LEAD_STATUSES } from "@/lib/db/schema";

export { LEAD_STATUSES };

export const leadStatusSchema = z.enum(LEAD_STATUSES);
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const leadNoteSchema = z
  .string()
  .trim()
  .max(4000, "字數過長")
  .optional()
  .or(z.literal(""));

export const leadStatusLabel: Record<LeadStatus, string> = {
  待處理: "待處理",
  已聯繫: "已聯繫",
  已排程: "已排程",
  已完成: "已完成",
};

/** 收件匣狀態徽章配色（沿用工程清單的語彙）*/
export const leadStatusBadge: Record<LeadStatus, string> = {
  待處理: "bg-secondary text-secondary-foreground",
  已聯繫: "bg-ink-50 text-ink-700",
  已排程: "bg-ink-100 text-ink-800",
  已完成: "bg-paper-400/60 text-dim",
};
