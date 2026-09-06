"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  HardHat,
  CalendarDays,
  Wrench,
  Package,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { visibleNav } from "@/lib/admin-nav";
import type { AdminUser } from "@/lib/db/schema";
import { logoutAction } from "@/app/(admin)/admin/actions";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Inbox,
  Users,
  HardHat,
  CalendarDays,
  Wrench,
  Package,
  FileText,
  Shield,
};

function isActive(pathname: string, href: string, match?: string) {
  if (match === "/admin$") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = visibleNav(user);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
      {items.map((it) => {
        const Icon = icons[it.icon] ?? LayoutDashboard;
        const active = isActive(pathname, it.href, it.match);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/75 hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-border p-3">
      <div className="mb-2 px-2 text-xs text-dim">
        {user.username}
        <span className="ml-1 rounded bg-secondary px-1 py-0.5 text-[10px] text-secondary-foreground">
          {user.role === "admin" ? "管理者" : "編輯"}
        </span>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="size-4" />
          登出
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* 行動裝置頂列 */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <span className="font-serif text-lg font-bold text-ink-800">
          大江防水 · 後台
        </span>
        <button
          type="button"
          aria-label="選單"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* 行動裝置抽屜 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card transition-transform md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="hidden items-center gap-2 border-b border-border px-5 py-4 md:flex">
          <span className="font-serif text-lg font-bold text-ink-800">
            大江防水
          </span>
          <span className="text-xs text-dim">後台</span>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
