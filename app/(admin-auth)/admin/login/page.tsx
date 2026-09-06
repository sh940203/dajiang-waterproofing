import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "後台登入",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  // 已登入就直接進後台
  if (await getCurrentUser()) redirect(nextPath ?? "/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper-200 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl font-bold text-ink-800">大江防水</p>
          <p className="mt-1 text-sm text-dim">後台管理系統</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}
