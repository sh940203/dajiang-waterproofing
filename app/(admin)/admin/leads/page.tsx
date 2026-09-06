import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, LEAD_STATUSES, type Lead } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { DataTable, type Header } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { parseListParams } from "@/lib/admin/list-params";
import { leadStatusBadge } from "@/lib/validation/lead";

export const metadata = { title: "預約詢價" };
export const dynamic = "force-dynamic";

const headers: Header[] = [
  { label: "姓名", sortKey: "name" },
  { label: "聯絡方式" },
  { label: "類型", className: "hidden md:table-cell" },
  { label: "狀態" },
  { label: "附件", className: "hidden lg:table-cell text-dim" },
  {
    label: "收到",
    sortKey: "createdAt",
    className: "hidden sm:table-cell text-dim",
  },
];

const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

export default async function LeadsPage({
  searchParams,
}: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const { q, page, pageSize, sort, dir } = parseListParams(sp, {
    defaultSort: "createdAt",
    sortable: ["name", "createdAt"],
  });
  const db = getDb();

  const statusRaw = one(sp.status);
  const status = LEAD_STATUSES.includes(statusRaw as never)
    ? (statusRaw as Lead["status"])
    : undefined;

  const where = and(
    q
      ? or(
          like(leads.name, `%${q}%`),
          like(leads.contact, `%${q}%`),
          like(leads.address, `%${q}%`),
        )
      : undefined,
    status ? eq(leads.status, status) : undefined,
  );

  const orderCol = sort === "name" ? leads.name : leads.createdAt;
  const orderBy = dir === "asc" ? asc(orderCol) : desc(orderCol);

  const [rows, [{ n: total }]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: count() }).from(leads).where(where),
  ]);

  const dataRows = rows.map((r) => ({
    id: r.id,
    href: `/admin/leads/${r.id}`,
    cells: [
      r.name,
      r.contact,
      r.serviceType ?? "—",
      <span
        key="s"
        className={`rounded-full px-2 py-0.5 text-xs ${leadStatusBadge[r.status]}`}
      >
        {r.status}
      </span>,
      r.photoKeys && r.photoKeys.length ? `${r.photoKeys.length} 張` : "—",
      r.createdAt.toLocaleDateString("zh-TW"),
    ],
  }));

  return (
    <>
      <PageHeader title="預約詢價" description="官網送出的詢價，依狀態跟進" />
      <ListToolbar searchParams={sp} placeholder="搜尋姓名 / 聯絡方式 / 地點">
        <StatusFilter
          searchParams={sp}
          basePath="/admin/leads"
          options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </ListToolbar>
      <DataTable
        headers={headers}
        rows={dataRows}
        searchParams={sp}
        sort={sort}
        dir={dir}
        empty={q || status ? "查無符合的詢價" : "目前沒有詢價紀錄"}
      />
      <Pagination
        searchParams={sp}
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/leads"
      />
    </>
  );
}
