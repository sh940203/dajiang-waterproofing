"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import type { NavNode } from "@/lib/site";
import { cn } from "@/lib/utils";

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader({
  nav,
  siteName,
  siteNameEn,
  phone,
  phoneHref,
}: {
  nav: NavNode[];
  siteName: string;
  siteNameEn: string;
  phone: string;
  phoneHref: string;
}) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 換頁時關閉行動選單（於 render 階段調整狀態，避免 effect 造成連鎖 render）
  const [navPath, setNavPath] = useState(pathname);
  if (pathname !== navPath) {
    setNavPath(pathname);
    setMobileOpen(false);
  }

  // 行動選單開啟時鎖定捲動 + Esc 關閉
  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled || mobileOpen
          ? "border-border bg-paper-200/90 backdrop-blur-md"
          : "border-transparent bg-paper-200/40 backdrop-blur-sm",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo size={scrolled ? 40 : 44} name={siteName} nameEn={siteNameEn} />

        {/* 桌機導覽 */}
        <nav aria-label="主選單" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((node) => {
              const active = isActive(pathname, node.href);
              if (!node.children) {
                return (
                  <li key={node.href}>
                    <Link
                      href={node.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm transition-colors",
                        active
                          ? "text-ink-800 font-medium"
                          : "text-foreground/75 hover:text-ink-800 hover:bg-ink-50",
                      )}
                    >
                      {node.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={node.href} className="group relative">
                  <Link
                    href={node.href}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors",
                      active
                        ? "text-ink-800 font-medium"
                        : "text-foreground/75 group-hover:text-ink-800 group-hover:bg-ink-50",
                    )}
                    aria-haspopup="true"
                  >
                    {node.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      aria-hidden
                      className="mt-0.5 transition-transform group-hover:rotate-180"
                    >
                      <path
                        d="M2.5 4.5 6 8l3.5-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Link>
                  {/* 下拉面板 */}
                  <div className="invisible absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-border bg-paper-100 p-2 shadow-[0_20px_50px_-24px_rgba(22,41,63,0.35)]">
                      {node.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-ink-50"
                        >
                          <span className="block text-sm font-medium text-ink-800">
                            {child.label}
                          </span>
                          {child.desc && (
                            <span className="mt-0.5 block text-xs text-dim">
                              {child.desc}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 桌機右側 CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={phoneHref}
            className="text-sm font-medium text-ink-800 hover:text-seal-500"
          >
            {phone}
          </a>
          <Link
            href="/inquiry"
            className="rounded-full bg-ink-800 px-5 py-2.5 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-700"
          >
            免費勘驗
          </Link>
        </div>

        {/* 行動漢堡鈕 */}
        <button
          type="button"
          className="relative z-50 -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:bg-ink-50 md:hidden"
          aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="relative block h-4 w-6">
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300",
                mobileOpen ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 block h-0.5 w-6 bg-current transition-all duration-300",
                mobileOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300",
                mobileOpen ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </div>

      {/* 行動選單面板 */}
      <MobileMenu
        open={mobileOpen}
        pathname={pathname}
        nav={nav}
        phone={phone}
        phoneHref={phoneHref}
      />
    </header>
  );
}

function MobileMenu({
  open,
  pathname,
  nav,
  phone,
  phoneHref,
}: {
  open: boolean;
  pathname: string;
  nav: NavNode[];
  phone: string;
  phoneHref: string;
}) {
  const [expanded, setExpanded] = useState<string | null>("/services");

  return (
    <div
      className={cn(
        "md:hidden overflow-hidden border-t border-border bg-paper-200 transition-[max-height,opacity] duration-300 ease-out",
        open ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <nav aria-label="行動選單" className="container-page py-4">
        <ul className="flex flex-col divide-y divide-border">
          {nav.map((node) => {
            const active = isActive(pathname, node.href);
            if (!node.children) {
              return (
                <li key={node.href}>
                  <Link
                    href={node.href}
                    className={cn(
                      "block py-3.5 text-base",
                      active ? "font-medium text-ink-800" : "text-foreground/80",
                    )}
                  >
                    {node.label}
                  </Link>
                </li>
              );
            }
            const isOpen = expanded === node.href;
            return (
              <li key={node.href} className="py-1.5">
                <div className="flex items-center justify-between">
                  <Link
                    href={node.href}
                    className={cn(
                      "py-2 text-base",
                      active ? "font-medium text-ink-800" : "text-foreground/80",
                    )}
                  >
                    {node.label}
                  </Link>
                  <button
                    type="button"
                    aria-label={isOpen ? "收合子選單" : "展開子選單"}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : node.href)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-50"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 12 12"
                      aria-hidden
                      className={cn("transition-transform", isOpen && "rotate-180")}
                    >
                      <path
                        d="M2.5 4.5 6 8l3.5-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  className={cn(
                    "overflow-hidden transition-[max-height] duration-300",
                    isOpen ? "max-h-96" : "max-h-0",
                  )}
                >
                  <ul className="flex flex-col gap-1 pb-2 pl-3">
                    {node.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2.5 text-sm text-foreground/75 hover:bg-ink-50 hover:text-ink-800"
                        >
                          {child.label}
                          {child.desc && (
                            <span className="mt-0.5 block text-xs text-dim">
                              {child.desc}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/inquiry"
            className="rounded-full bg-ink-800 px-5 py-3 text-center text-sm font-medium text-paper-100"
          >
            免費現場勘驗
          </Link>
          <a
            href={phoneHref}
            className="rounded-full border border-ink-800/25 px-5 py-3 text-center text-sm font-medium text-ink-800"
          >
            撥打 {phone}
          </a>
        </div>
      </nav>
    </div>
  );
}
