import Link from "next/link";
import { and, asc, count, desc, eq, gte, isNotNull, like } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  customers,
  leads,
  LEAD_STATUSES,
  projects,
  PROJECT_STATUSES,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "總覽" };
export const dynamic = "force-dynamic";

const monthPrefix = () => new Date().toISOString().slice(0, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);

async function leadStatusCounts() {
  const rows = await getDb()
    .select({ status: leads.status, n: count() })
    .from(leads)
    .groupBy(leads.status);
  const map = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  return LEAD_STATUSES.map((s) => ({ status: s, n: map[s] ?? 0 }));
}

async function projectStatusCounts() {
  const rows = await getDb()
    .select({ status: projects.status, n: count() })
    .from(projects)
    .groupBy(projects.status);
  const map = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  return PROJECT_STATUSES.map((s) => ({ status: s, n: map[s] ?? 0 }));
}

function Bars({
  data,
  label,
}: {
  data: { status: string; n: number }[];
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-ink-800">{label}</h2>
      <Card>
        <CardContent className="grid gap-2.5 p-5">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 text-dim">{d.status}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-paper-300">
                <div
                  className="h-full rounded bg-ink-600"
                  style={{ width: `${(d.n / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums text-ink-800">
                {d.n}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function RecentLeads({
  rows,
}: {
  rows: {
    id: string;
    name: string;
    serviceType: string | null;
    contact: string;
    address: string | null;
    status: string;
  }[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-800">近期詢價</h2>
        <Link href="/admin/leads" className="text-sm text-ink-600 hover:underline">
          全部
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-dim">
              目前沒有詢價紀錄
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">
                        {l.name}
                        <span className="ml-2 font-normal text-dim">
                          {l.serviceType}
                        </span>
                      </p>
                      <p className="truncate text-xs text-dim">
                        {l.contact} · {l.address}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {l.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  const db = getDb();
  const isAdmin = user?.role === "admin";

  const recentLeads = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(6);

  /* ---------- editor：只看詢價 ---------- */
  if (!isAdmin) {
    const [{ n: pendingLeads }] = await db
      .select({ n: count() })
      .from(leads)
      .where(eq(leads.status, "待處理"));
    return (
      <>
        <PageHeader title="總覽" description="待處理的詢價" />
        <Link href="/admin/leads">
          <Card className="max-w-xs transition-colors hover:border-ink-300">
            <CardContent className="p-5">
              <p className="text-sm text-dim">待處理詢價</p>
              <p className="mt-2 text-3xl font-semibold text-ink-800">
                {pendingLeads}
              </p>
            </CardContent>
          </Card>
        </Link>
        <div className="mt-8 max-w-2xl">
          <RecentLeads rows={recentLeads} />
        </div>
      </>
    );
  }

  /* ---------- admin：完整儀表板 ---------- */
  const [stats, upcoming, leadBars, projectBars] = await Promise.all([
    (async () => {
      const [pl, ap, pi, mp] = await Promise.all([
        db.select({ n: count() }).from(leads).where(eq(leads.status, "待處理")),
        db
          .select({ n: count() })
          .from(projects)
          .where(eq(projects.status, "施工中")),
        db
          .select({ n: count() })
          .from(projects)
          .where(eq(projects.status, "勘驗")),
        db
          .select({ n: count() })
          .from(projects)
          .where(like(projects.startDate, `${monthPrefix()}%`)),
      ]);
      return {
        pendingLeads: pl[0].n,
        activeProjects: ap[0].n,
        pendingInspect: pi[0].n,
        monthProjects: mp[0].n,
      };
    })(),
    db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        customerName: customers.name,
      })
      .from(projects)
      .leftJoin(customers, eq(projects.customerId, customers.id))
      .where(
        and(isNotNull(projects.startDate), gte(projects.startDate, todayISO())),
      )
      .orderBy(asc(projects.startDate))
      .limit(6),
    leadStatusCounts(),
    projectStatusCounts(),
  ]);

  const cards = [
    { label: "待處理詢價", value: stats.pendingLeads, href: "/admin/leads" },
    { label: "進行中工程", value: stats.activeProjects, href: "/admin/projects" },
    { label: "待勘驗", value: stats.pendingInspect, href: "/admin/projects" },
    { label: "本月工程", value: stats.monthProjects, href: "/admin/calendar" },
  ];

  return (
    <>
      <PageHeader title="總覽" description="待辦與近期動態" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="transition-colors hover:border-ink-300">
              <CardContent className="p-5">
                <p className="text-sm text-dim">{c.label}</p>
                <p className="mt-2 text-3xl font-semibold text-ink-800">
                  {c.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Bars data={projectBars} label="工程狀態分佈" />
        <Bars data={leadBars} label="詢價狀態分佈" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentLeads rows={recentLeads} />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-800">即將施工</h2>
            <Link
              href="/admin/calendar"
              className="text-sm text-ink-600 hover:underline"
            >
              行事曆
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              {upcoming.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-dim">
                  近期沒有排定的工程
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-accent"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-800">
                            {p.title}
                            <span className="ml-2 font-normal text-dim">
                              {p.customerName ?? "—"}
                            </span>
                          </p>
                          <p className="truncate text-xs text-dim">
                            {p.startDate}
                            {p.endDate ? ` ~ ${p.endDate}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {p.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
