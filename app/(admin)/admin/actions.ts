"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  invalidateSession,
  readSessionCookie,
} from "@/lib/auth/session";

export async function logoutAction() {
  const token = await readSessionCookie();
  if (token) await invalidateSession(token);
  await clearSessionCookie();
  redirect("/admin/login");
}
