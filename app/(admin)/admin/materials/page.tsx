import { count, desc, asc, like, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { DataTable, type Header } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { parseListParams } from "@/lib/admin/list-params";

export const metadata = { title: "物料" };
export const dynamic = "force-dynamic";

const headers: Header[] = [
  { label: "名稱", sortKey: "name" },
  { label: "規格", className: "hidden md:table-cell" },
  { label: "單位" },
  { label: "單價", sortKey: "unitPrice", className: "text-right" },
  { label: "供應商", className: "hidden lg:table-cell" },
];

const fmt = (n: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString("zh-TW", { maximumFractionDigits: 2 });

export default async function MaterialsPage({
  searchParams,
}: PageProps<"/admin/materials">) {
  const sp = await searchParams;
  const { q, page, pageSize, sort, dir } = parseListParams(sp, {
    defaultSort: "name",
    sortable: ["name", "unitPrice"],
  });
  const db = getDb();

  const where = q
    ? or(
        like(materials.name, `%${q}%`),
        like(materials.spec, `%${q}%`),
        like(materials.supplier, `%${q}%`),
      )
    : undefined;
  const orderCol = sort === "unitPrice" ? materials.unitPrice : materials.name;
  const orderBy = dir === "asc" ? asc(orderCol) : desc(orderCol);

  const [data, [{ n: total }]] = await Promise.all([
    db
      .select()
      .from(materials)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: count() }).from(materials).where(where),
  ]);

  const rows = data.map((r) => ({
    id: r.id,
    href: `/admin/materials/${r.id}`,
    cells: [
      r.name,
      r.spec ?? "—",
      r.unit ?? "—",
      fmt(r.unitPrice),
      r.supplier ?? "—",
    ],
  }));

  return (
    <>
      <PageHeader title="物料" description="材料清單與單價" />
      <ListToolbar
        searchParams={sp}
        placeholder="搜尋名稱 / 規格 / 供應商"
        newHref="/admin/materials/new"
        newLabel="新增物料"
      />
      <DataTable
        headers={headers}
        rows={rows}
        searchParams={sp}
        sort={sort}
        dir={dir}
        empty={q ? "查無符合的物料" : "還沒有物料，點右上角新增"}
      />
      <Pagination
        searchParams={sp}
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/materials"
      />
    </>
  );
}
