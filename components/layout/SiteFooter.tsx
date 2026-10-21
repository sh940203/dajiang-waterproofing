import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { FacebookIcon, InstagramIcon, LineIcon } from "@/components/ui/SocialIcons";
import type { NavNode } from "@/lib/site";
import type { ContactReady, Site } from "@/lib/content/settings";

export function SiteFooter({
  nav,
  site,
  contactReady,
}: {
  nav: NavNode[];
  site: Site;
  contactReady: ContactReady;
}) {
  const year = new Date().getFullYear();
  const services = nav.find((n) => n.href === "/services")?.children ?? [];

  return (
    <footer className="mt-24 bg-ink-900 text-paper-200">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light withWordmark size={48} name={site.name} nameEn={site.nameEn} />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper-200/70">
            {site.tagline}
          </p>
          <p className="mt-4 text-xs tracking-wider text-paper-200/50">
            服務範圍：{site.serviceArea}
          </p>
        </div>

        <nav aria-label="頁尾選單">
          <h3 className="text-sm font-semibold tracking-widest text-paper-100">
            網站導覽
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="text-paper-200/70 transition-colors hover:text-paper-100"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="服務項目">
          <h3 className="text-sm font-semibold tracking-widest text-paper-100">
            服務項目
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="text-paper-200/70 transition-colors hover:text-paper-100"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold tracking-widest text-paper-100">
            聯絡我們
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-paper-200/70">
            <li className="flex items-center gap-2">
              <Phone aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
              電話：
              <a href={site.phoneHref} className="hover:text-paper-100">
                {site.phone}
              </a>
            </li>
            {contactReady.line && (
              <li className="flex items-center gap-2">
                <LineIcon aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
                LINE：
                <a
                  href={site.lineHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-paper-100"
                >
                  {site.lineId}
                </a>
              </li>
            )}
            {contactReady.facebook && (
              <li className="flex items-center gap-2">
                <FacebookIcon aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
                Facebook：
                <a
                  href={site.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-paper-100"
                >
                  大江防水粉絲專頁
                </a>
              </li>
            )}
            {contactReady.instagram && (
              <li className="flex items-center gap-2">
                <InstagramIcon aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
                Instagram：
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-paper-100"
                >
                  @dajiang_2026
                </a>
              </li>
            )}
            {contactReady.email && (
              <li className="flex items-center gap-2">
                <Mail aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
                Email：
                <a href={`mailto:${site.email}`} className="hover:text-paper-100">
                  {site.email}
                </a>
              </li>
            )}
            {contactReady.address && (
              <li className="flex items-center gap-2">
                <MapPin aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
                地址：{site.address}
              </li>
            )}
            <li className="flex items-center gap-2">
              <Clock aria-hidden size={14} strokeWidth={1.8} className="shrink-0" />
              營業時間：{site.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper-200/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-paper-200/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}（{site.nameEn}）. All rights reserved.
          </p>
          <p>屋頂・鐵皮屋防水隔熱工程</p>
        </div>
      </div>
    </footer>
  );
}
