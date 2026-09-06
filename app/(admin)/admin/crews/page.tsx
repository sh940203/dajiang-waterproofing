import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { crews, type Crew } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { DataTable, type Header } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { parseListParams } from "@/lib/admin/list-params";
import { CREW_STATUS, crewStatusLabel } from "@/lib/validation/crew";

export const metadata = { title: "工班" };
export const dynamic = "force-dynamic";

const badge: Record<Crew["status"], string> = {
  available: "bg-ink-50 text-ink-700",
  busy: "bg-secondary text-secondary-foreground",
  off: "bg-paper-400/60 text-dim",
};

const headers: Header[] = [
  { label: "姓名 / 工班", sortKey: "name" },
  { label: "電話" },
  { label: "專長", className: "hidden md:table-cell" },
  { label: "狀態" },
];

export default async function CrewsPage({
  searchParams,
}: PageProps<"/admin/crews">) {
  const sp = await searchParams;
  const { q, page, pageSize, sort, dir } = parseListParams(sp, {
    defaultSort: "name",
    sortable: ["name"],
  });
  const statusRaw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = CREW_STATUS.includes(statusRaw as never)
    ? (statusRaw as Crew["status"])
    : undefined;
  const db = getDb();

  const where = and(
    q ? or(like(crews.name, `%${q}%`), like(crews.specialty, `%${q}%`)) : undefined,
    status ? eq(crews.status, status) : undefined,
  );
  const orderBy = dir === "asc" ? asc(crews.name) : desc(crews.name);

  const [data, [{ n: total }]] = await Promise.all([
    db
      .select()
      .from(crews)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: count() }).from(crews).where(where),
  ]);

  const rows = data.map((r) => ({
    id: r.id,
    href: `/admin/crews/${r.id}`,
    cells: [
      r.name,
      r.phone ?? "—",
      r.specialty ?? "—",
      <span
        key="s"
        className={`rounded-full px-2 py-0.5 text-xs ${badge[r.status]}`}
      >
        {crewStatusLabel[r.status]}
      </span>,
    ],
  }));

  return (
    <>
      <PageHeader title="工班" description="師傅 / 工班資料與可用狀態" />
      <ListToolbar
        searchParams={sp}
        placeholder="搜尋姓名 / 專長"
        newHref="/admin/crews/new"
        newLabel="新增工班"
      >
        <StatusFilter
          searchParams={sp}
          basePath="/admin/crews"
          options={CREW_STATUS.map((s) => ({
            value: s,
            label: crewStatusLabel[s],
          }))}
        />
      </ListToolbar>
      <DataTable
        headers={headers}
        rows={rows}
        searchParams={sp}
        sort={sort}
        dir={dir}
        empty={q || status ? "查無符合的工班" : "還沒有工班，點右上角新增"}
      />
      <Pagination
        searchParams={sp}
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/crews"
      />
    </>
  );
}
