import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getMainNav, getSite, contactReadyFrom } from "@/lib/content/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [nav, site] = await Promise.all([getMainNav(), getSite()]);
  const contactReady = contactReadyFrom(site);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-paper-100"
      >
        跳至主要內容
      </a>
      <SiteHeader
        nav={nav}
        siteName={site.name}
        siteNameEn={site.nameEn}
        phone={site.phone}
        phoneHref={site.phoneHref}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter nav={nav} site={site} contactReady={contactReady} />
    </>
  );
}
