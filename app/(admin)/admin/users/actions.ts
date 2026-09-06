"use server";

import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { invalidateAllUserSessions } from "@/lib/auth/session";
import {
  createUserSchema,
  resetPasswordSchema,
  USER_ROLES,
  type CreateUserInput,
} from "@/lib/validation/user";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createUser(
  input: CreateUserInput,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = createUserSchema.safeParse(input);
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "輸入有誤" };

  const db = getDb();
  const dupe = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, p.data.username),
  });
  if (dupe) return { ok: false, error: "帳號已存在" };

  const [row] = await db
    .insert(adminUsers)
    .values({
      username: p.data.username,
      passwordHash: await hashPassword(p.data.password),
      role: p.data.role,
    })
    .returning({ id: adminUsers.id });

  revalidatePath("/admin/users");
  return { ok: true, id: row.id };
}

export async function setUserRole(
  id: string,
  role: string,
): Promise<ActionResult> {
  const me = await getAdminOrThrow();
  if (!USER_ROLES.includes(role as never))
    return { ok: false, error: "角色值不正確" };
  if (id === me.id && role !== "admin")
    return { ok: false, error: "不能把自己降級" };

  // 至少保留一位啟用中的 admin
  if (role !== "admin") {
    const target = await getDb().query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    });
    if (target?.role === "admin") {
      const [{ n }] = await getDb()
        .select({ n: count() })
        .from(adminUsers)
        .where(eq(adminUsers.role, "admin"));
      if (n <= 1) return { ok: false, error: "至少要保留一位管理者" };
    }
  }

  await getDb()
    .update(adminUsers)
    .set({ role: role as (typeof USER_ROLES)[number] })
    .where(eq(adminUsers.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true, id };
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const me = await getAdminOrThrow();
  if (id === me.id && !active)
    return { ok: false, error: "不能停用自己的帳號" };

  if (!active) {
    const target = await getDb().query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    });
    if (target?.role === "admin" && target.active) {
      const [{ n }] = await getDb()
        .select({ n: count() })
        .from(adminUsers)
        .where(eq(adminUsers.role, "admin"));
      if (n <= 1) return { ok: false, error: "至少要保留一位啟用中的管理者" };
    }
  }

  await getDb()
    .update(adminUsers)
    .set({ active })
    .where(eq(adminUsers.id, id));
  if (!active) await invalidateAllUserSessions(id);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true, id };
}

export async function resetUserPassword(
  id: string,
  password: string,
): Promise<ActionResult> {
  await getAdminOrThrow();
  const p = resetPasswordSchema.safeParse({ password });
  if (!p.success)
    return { ok: false, error: p.error.issues[0]?.message ?? "密碼不符規則" };

  await getDb()
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(p.data.password) })
    .where(eq(adminUsers.id, id));
  // 重設密碼後踢掉該使用者所有既有 session
  await invalidateAllUserSessions(id);

  revalidatePath(`/admin/users/${id}`);
  return { ok: true, id };
}
