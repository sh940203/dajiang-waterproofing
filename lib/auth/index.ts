import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import {
  readSessionCookie,
  setSessionCookie,
  validateSessionToken,
} from "@/lib/auth/session";
import type { AdminUser } from "@/lib/db/schema";

export type { AdminUser };

/** 目前登入的後台使用者（每個 request 只查一次）。未登入回 null。 */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const token = await readSessionCookie();
  if (!token) return null;

  const result = await validateSessionToken(token);
  if (!result) return null;

  if (result.refreshedExpiresAt) {
    try {
      await setSessionCookie(token, result.refreshedExpiresAt);
    } catch {
      // 在無法寫 cookie 的情境（例如 RSC render 後）忽略即可
    }
  }
  return result.user;
});

/** 需要登入；否則導去登入頁。回傳使用者。 */
export async function requireUser(nextPath?: string): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      nextPath
        ? `/admin/login?next=${encodeURIComponent(nextPath)}`
        : "/admin/login",
    );
  }
  return user;
}

/** server action 用：未登入直接 throw（不 redirect）。 */
export async function getUserOrThrow(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登入");
  return user;
}

/** server action 用：需要 admin 角色，否則 throw。 */
export async function getAdminOrThrow(): Promise<AdminUser> {
  const user = await getUserOrThrow();
  if (user.role !== "admin") throw new Error("權限不足");
  return user;
}

/** 需要特定角色（目前只有 admin / editor）。 */
export async function requireRole(
  role: AdminUser["role"],
  nextPath?: string,
): Promise<AdminUser> {
  const user = await requireUser(nextPath);
  if (role === "admin" && user.role !== "admin") {
    redirect("/admin");
  }
  return user;
}
