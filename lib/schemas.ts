import { z } from "zod";

/** 表單「其他」選項——不在服務清單裡的固定選項 */
export const OTHER_SERVICE_TYPE = "其他 / 尚未確定";

export const inquirySchema = z.object({
  name: z
    .string({ error: "請填寫稱呼" })
    .trim()
    .min(2, "請填寫稱呼（至少 2 個字）")
    .max(40, "字數過長"),
  contact: z
    .string({ error: "請留下聯絡方式" })
    .trim()
    .min(6, "請留下電話、LINE ID 或 Email 其中一種")
    .max(120, "字數過長"),
  address: z
    .string({ error: "請填寫施工地點" })
    .trim()
    .min(4, "請填寫大致的施工地點（縣市 / 行政區即可）")
    .max(120, "字數過長"),
  // 服務類型清單改由後台「服務項目」動態提供，這裡只驗證非空
  serviceType: z
    .string({ error: "請選擇防水類型" })
    .trim()
    .min(1, "請選擇防水類型")
    .max(60, "字數過長"),
  preferredTime: z.string().trim().max(120, "字數過長").optional().or(z.literal("")),
  description: z
    .string({ error: "請描述滲漏狀況" })
    .trim()
    .min(10, "請簡單描述滲漏狀況（至少 10 個字），方便我們評估")
    .max(1000, "字數過長"),
  // 蜜罐欄位：正常使用者不會填
  company: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
