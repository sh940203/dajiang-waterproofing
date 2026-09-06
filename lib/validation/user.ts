import { z } from "zod";

export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const userRoleLabel: Record<UserRole, string> = {
  admin: "管理者",
  editor: "編輯",
};

const username = z
  .string()
  .trim()
  .min(3, "帳號至少 3 個字")
  .max(40, "字數過長")
  .regex(/^[a-zA-Z0-9_.-]+$/, "只能用英數與 _ . -");

const password = z
  .string()
  .min(8, "密碼至少 8 個字")
  .max(200, "字數過長");

export const createUserSchema = z.object({
  username,
  password,
  role: z.enum(USER_ROLES),
});

export const resetPasswordSchema = z.object({ password });

export type CreateUserInput = z.infer<typeof createUserSchema>;
