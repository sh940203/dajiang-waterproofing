import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminUsers, sessions, type AdminUser } from "@/lib/db/schema";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export { SESSION_COOKIE };
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天
const REFRESH_MS = 15 * 24 * 60 * 60 * 1000; // 剩不到 15 天就續期

function toBase64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 建立 session，回傳要放進 cookie 的原始 token */
export async function createSession(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = toBase64url(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + TTL_MS);
  await getDb()
    .insert(sessions)
    .values({ id: await sha256Hex(token), userId, expiresAt });
  return { token, expiresAt };
}

export type SessionValidation = {
  user: AdminUser;
  /** 若有觸發滑動續期，這裡帶新的到期日，呼叫端需重寫 cookie */
  refreshedExpiresAt?: Date;
};

export async function validateSessionToken(
  token: string,
): Promise<SessionValidation | null> {
  const id = await sha256Hex(token);
  const db = getDb();
  const row = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
  if (!row) return null;

  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, row.userId),
  });
  if (!user || !user.active) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  let refreshedExpiresAt: Date | undefined;
  if (row.expiresAt.getTime() - Date.now() < REFRESH_MS) {
    refreshedExpiresAt = new Date(Date.now() + TTL_MS);
    await db
      .update(sessions)
      .set({ expiresAt: refreshedExpiresAt })
      .where(eq(sessions.id, id));
  }

  return { user, refreshedExpiresAt };
}

export async function invalidateSession(token: string) {
  await getDb().delete(sessions).where(eq(sessions.id, await sha256Hex(token)));
}

export async function invalidateAllUserSessions(userId: string) {
  await getDb().delete(sessions).where(eq(sessions.userId, userId));
}

/* -------- cookie helpers -------- */
export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value || undefined;
}
