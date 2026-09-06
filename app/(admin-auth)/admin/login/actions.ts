"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  username: z.string().trim().min(1, "請輸入帳號").max(64),
  password: z.string().min(1, "請輸入密碼").max(200),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

// 每個 isolate 的簡易失敗退避（防連續嘗試）。argon2 本身也已是天然節流。
const attempts = new Map<string, { n: number; until: number }>();

function safeNext(next?: string): string {
  return next && next.startsWith("/admin") && !next.startsWith("//")
    ? next
    : "/admin";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }
  const { username, password } = parsed.data;

  const key = username.toLowerCase();
  const rec = attempts.get(key);
  if (rec && rec.until > Date.now()) {
    return { error: "嘗試過於頻繁，請稍後再試" };
  }

  const user = await getDb().query.adminUsers.findFirst({
    where: eq(adminUsers.username, username),
  });

  const ok =
    !!user &&
    user.active &&
    (await verifyPassword(user.passwordHash, password));

  if (!ok) {
    const n = (rec?.n ?? 0) + 1;
    attempts.set(key, {
      n,
      until: n >= 5 ? Date.now() + 60_000 : 0,
    });
    return { error: "帳號或密碼錯誤" };
  }

  attempts.delete(key);
  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);
  redirect(safeNext(parsed.data.next));
}
