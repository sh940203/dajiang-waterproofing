import { z } from "zod";

/** 網站設定：純 key/value 字串（前台 contactReady 由「非空」推導）*/
export const SETTING_FIELDS: {
  key: string;
  label: string;
  type: "text" | "textarea";
  hint?: string;
}[] = [
  { key: "name", label: "公司名稱", type: "text" },
  { key: "nameEn", label: "英文名 / 標語", type: "text" },
  { key: "tagline", label: "品牌標語", type: "textarea" },
  { key: "pitch", label: "精簡定位", type: "textarea" },
  { key: "description", label: "網站描述（SEO）", type: "textarea" },
  { key: "phone", label: "電話（顯示用）", type: "text" },
  { key: "phoneHref", label: "電話連結", type: "text", hint: "例：tel:0958146555" },
  { key: "lineId", label: "LINE ID", type: "text", hint: "留空則前台不顯示" },
  { key: "lineHref", label: "LINE 連結", type: "text" },
  { key: "email", label: "Email", type: "text", hint: "留空則前台不顯示" },
  { key: "address", label: "地址", type: "text", hint: "留空則前台不顯示" },
  { key: "hours", label: "營業時間", type: "text" },
  { key: "serviceArea", label: "服務範圍", type: "text" },
];

export const settingsSchema = z.object({
  values: z.record(z.string(), z.string().trim().max(2000, "字數過長")),
  coreValues: z
    .array(
      z.object({
        element: z.string().trim().min(1, "必填").max(4),
        label: z.string().trim().min(1, "必填").max(20),
        summary: z.string().trim().min(1, "必填").max(400),
      }),
    )
    .min(1, "至少一項")
    .max(6),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
