import Link from "next/link";
import { and, asc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  crews,
  projectCrews,
  projects,
  PROJECT_STATUSES,
  type Project,
} from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { CalendarView } from "@/components/admin/calendar/CalendarView";

export const metadata = { title: "行事曆" };
export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<Project["status"], string> = {
  勘驗: "#9aa7b4",
  報價: "#5b7a99",
  施工中: "#2f5d8a",
  完工: "#3f7d5c",
  保固中: "#7a8aa0",
};

const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

/** 全日事件 end 為 exclusive，結束日 +1 天（純 UTC 計算，避免時區倒退一天）*/
function endExclusive(d: string | null): string | undefined {
  if (!d) return undefined;
  const dt = new Date(d + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

export default async function CalendarPage({
  searchParams,
}: PageProps<"/admin/calendar">) {
  const sp = await searchParams;
  const db = getDb();

  const statusRaw = one(sp.status);
  const status = PROJECT_STATUSES.includes(statusRaw as never)
    ? (statusRaw as Project["status"])
    : undefined;
  const crewId = one(sp.crew) || undefined;

  const crewOpts = await db
    .select({ id: crews.id, name: crews.name })
    .from(crews)
    .orderBy(asc(crews.name));

  const crewFilter = crewId
    ? inArray(
        projects.id,
        db
          .select({ id: projectCrews.projectId })
          .from(projectCrews)
          .where(eq(projectCrews.crewId, crewId)),
      )
    : undefined;

  const [scheduled, unscheduled] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
      })
      .from(projects)
      .where(
        and(
          isNotNull(projects.startDate),
          status ? eq(projects.status, status) : undefined,
          crewFilter,
        ),
      ),
    db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
      })
      .from(projects)
      .where(
        and(
          isNull(projects.startDate),
          status ? eq(projects.status, status) : undefined,
          crewFilter,
        ),
      )
      .orderBy(asc(projects.title)),
  ]);

  const events = scheduled.map((p) => ({
    id: p.id,
    title: `${p.title}（${p.status}）`,
    start: p.startDate as string,
    end: endExclusive(p.endDate ?? p.startDate),
    color: STATUS_COLOR[p.status],
  }));

  return (
    <>
      <PageHeader title="行事曆" description="有排定日期的工程；未排程的列在右側" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusFilter
          searchParams={sp}
          basePath="/admin/calendar"
          options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <StatusFilter
          searchParams={sp}
          basePath="/admin/calendar"
          paramKey="crew"
          allLabel="全部工班"
          options={crewOpts.map((c) => ({ value: c.id, label: c.name }))}
        />
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-dim">
          {PROJECT_STATUSES.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[s] }}
              />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <CalendarView events={events} />

        <aside className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink-800">
            未排程工程
            <span className="ml-1.5 font-normal text-dim">
              {unscheduled.length}
            </span>
          </h2>
          {unscheduled.length === 0 ? (
            <p className="text-xs text-dim">目前沒有未排程的工程</p>
          ) : (
            <ul className="grid gap-1.5">
              {unscheduled.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[p.status] }}
                    />
                    <span className="truncate">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
