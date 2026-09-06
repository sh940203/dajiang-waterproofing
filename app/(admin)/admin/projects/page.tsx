import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
} from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  crews,
  customers,
  projectCrews,
  projects,
  PROJECT_STATUSES,
  type Project,
} from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { DataTable, type Header } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { parseListParams } from "@/lib/admin/list-params";

export const metadata = { title: "工程" };
export const dynamic = "force-dynamic";

const statusBadge: Record<Project["status"], string> = {
  勘驗: "bg-paper-400/60 text-dim",
  報價: "bg-ink-50 text-ink-700",
  施工中: "bg-secondary text-secondary-foreground",
  完工: "bg-ink-100 text-ink-800",
  保固中: "bg-ink-50 text-ink-600",
};

const headers: Header[] = [
  { label: "工程名稱", sortKey: "title" },
  { label: "客戶", className: "hidden md:table-cell" },
  { label: "狀態" },
  { label: "起訖日", sortKey: "startDate", className: "hidden sm:table-cell" },
  {
    label: "建立",
    sortKey: "createdAt",
    className: "hidden lg:table-cell text-dim",
  },
];

const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProjectsPage({
  searchParams,
}: PageProps<"/admin/projects">) {
  const sp = await searchParams;
  const { q, page, pageSize, sort, dir } = parseListParams(sp, {
    defaultSort: "createdAt",
    sortable: ["title", "startDate", "createdAt"],
  });
  const db = getDb();

  const statusRaw = one(sp.status);
  const status = PROJECT_STATUSES.includes(statusRaw as never)
    ? (statusRaw as Project["status"])
    : undefined;
  const customerId = one(sp.customer) || undefined;
  const crewId = one(sp.crew) || undefined;
  const from = one(sp.from) || undefined;
  const to = one(sp.to) || undefined;

  const [customerOpts, crewOpts] = await Promise.all([
    db
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .orderBy(asc(customers.name)),
    db
      .select({ id: crews.id, name: crews.name })
      .from(crews)
      .orderBy(asc(crews.name)),
  ]);

  const where = and(
    q
      ? or(like(projects.title, `%${q}%`), like(projects.address, `%${q}%`))
      : undefined,
    status ? eq(projects.status, status) : undefined,
    customerId ? eq(projects.customerId, customerId) : undefined,
    from ? gte(projects.startDate, from) : undefined,
    to ? lte(projects.startDate, to) : undefined,
    crewId
      ? inArray(
          projects.id,
          db
            .select({ id: projectCrews.projectId })
            .from(projectCrews)
            .where(eq(projectCrews.crewId, crewId)),
        )
      : undefined,
  );

  const orderCol =
    sort === "title"
      ? projects.title
      : sort === "startDate"
        ? projects.startDate
        : projects.createdAt;
  const orderBy = dir === "asc" ? asc(orderCol) : desc(orderCol);

  const [rows, [{ n: total }]] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        customerName: customers.name,
      })
      .from(projects)
      .leftJoin(customers, eq(projects.customerId, customers.id))
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: count() }).from(projects).where(where),
  ]);

  const anyFilter = Boolean(q || status || customerId || crewId || from || to);

  const dataRows = rows.map((r) => ({
    id: r.id,
    href: `/admin/projects/${r.id}`,
    cells: [
      r.title,
      r.customerName ?? "—",
      <span
        key="s"
        className={`rounded-full px-2 py-0.5 text-xs ${statusBadge[r.status]}`}
      >
        {r.status}
      </span>,
      r.startDate
        ? `${r.startDate}${r.endDate ? ` ~ ${r.endDate}` : ""}`
        : "未排程",
      r.createdAt.toLocaleDateString("zh-TW"),
    ],
  }));

  return (
    <>
      <PageHeader title="工程" description="工程進度、派工與物料" />
      <ListToolbar
        searchParams={sp}
        placeholder="搜尋工程名稱 / 地址"
        newHref="/admin/projects/new"
        newLabel="新增工程"
      >
        <StatusFilter
          searchParams={sp}
          basePath="/admin/projects"
          options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <StatusFilter
          searchParams={sp}
          basePath="/admin/projects"
          paramKey="customer"
          allLabel="全部客戶"
          options={customerOpts.map((c) => ({ value: c.id, label: c.name }))}
        />
        <StatusFilter
          searchParams={sp}
          basePath="/admin/projects"
          paramKey="crew"
          allLabel="全部工班"
          options={crewOpts.map((c) => ({ value: c.id, label: c.name }))}
        />
        <DateRangeFilter searchParams={sp} basePath="/admin/projects" />
      </ListToolbar>
      <DataTable
        headers={headers}
        rows={dataRows}
        searchParams={sp}
        sort={sort}
        dir={dir}
        empty={anyFilter ? "查無符合的工程" : "還沒有工程，點右上角新增"}
      />
      <Pagination
        searchParams={sp}
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/projects"
      />
    </>
  );
}
