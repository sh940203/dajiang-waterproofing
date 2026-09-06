import type { AdminUser } from "@/lib/db/schema";

export type AdminNavItem = {
  href: string;
  label: string;
  /** lucide icon 名稱（在 AdminSidebar 對應）*/
  icon: string;
  /** 僅 admin 可見（editor 看不到、也不能進）*/
  adminOnly?: boolean;
  /** 用來判斷 active（startsWith），預設 = href */
  match?: string;
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "總覽", icon: "LayoutDashboard", match: "/admin$" },
  { href: "/admin/leads", label: "預約詢價", icon: "Inbox" },
  { href: "/admin/customers", label: "客戶", icon: "Users", adminOnly: true },
  { href: "/admin/projects", label: "工程", icon: "HardHat", adminOnly: true },
  {
    href: "/admin/calendar",
    label: "行事曆",
    icon: "CalendarDays",
    adminOnly: true,
  },
  { href: "/admin/crews", label: "工班", icon: "Wrench", adminOnly: true },
  { href: "/admin/materials", label: "物料", icon: "Package", adminOnly: true },
  { href: "/admin/content", label: "內容管理", icon: "FileText" },
  { href: "/admin/users", label: "使用者", icon: "Shield", adminOnly: true },
];

export function visibleNav(user: Pick<AdminUser, "role">) {
  return adminNav.filter((i) => !i.adminOnly || user.role === "admin");
}

/** editor 不可進入的路徑前綴（頁面層 requireRole 之外的雙重把關參考）*/
export const EDITOR_BLOCKED_PREFIXES = [
  "/admin/customers",
  "/admin/projects",
  "/admin/calendar",
  "/admin/crews",
  "/admin/materials",
  "/admin/users",
  "/admin/content/settings",
] as const;

export function isEditorAllowed(pathname: string): boolean {
  return !EDITOR_BLOCKED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
