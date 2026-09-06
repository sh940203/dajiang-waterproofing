import { count, desc, asc, like, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { DataTable, type Header } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { parseListParams } from "@/lib/admin/list-params";

export const metadata = { title: "客戶" };
export const dynamic = "force-dynamic";

const headers: Header[] = [
  { label: "姓名", sortKey: "name" },
  { label: "電話" },
  { label: "Email", className: "hidden md:table-cell" },
  { label: "來源", className: "hidden lg:table-cell" },
  { label: "建立", sortKey: "createdAt", className: "hidden sm:table-cell text-dim" },
];

export default async function CustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  const sp = await searchParams;
  const { q, page, pageSize, sort, dir } = parseListParams(sp, {
    defaultSort: "createdAt",
    sortable: ["name", "createdAt"],
  });
  const db = getDb();

  const where = q
    ? or(
        like(customers.name, `%${q}%`),
        like(customers.phone, `%${q}%`),
        like(customers.email, `%${q}%`),
      )
    : undefined;
  const orderCol = sort === "name" ? customers.name : customers.createdAt;
  const orderBy = dir === "asc" ? asc(orderCol) : desc(orderCol);

  const [data, [{ n: total }]] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: count() }).from(customers).where(where),
  ]);

  const rows = data.map((r) => ({
    id: r.id,
    href: `/admin/customers/${r.id}`,
    cells: [
      r.name,
      r.phone ?? "—",
      r.email ?? "—",
      r.source ?? "—",
      r.createdAt.toLocaleDateString("zh-TW"),
    ],
  }));

  return (
    <>
      <PageHeader title="客戶" description="客戶資料與聯絡方式" />
      <ListToolbar
        searchParams={sp}
        placeholder="搜尋姓名 / 電話 / Email"
        newHref="/admin/customers/new"
        newLabel="新增客戶"
      />
      <DataTable
        headers={headers}
        rows={rows}
        searchParams={sp}
        sort={sort}
        dir={dir}
        empty={q ? "查無符合的客戶" : "還沒有客戶，點右上角新增"}
      />
      <Pagination
        searchParams={sp}
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/customers"
      />
    </>
  );
}
