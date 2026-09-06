/** 後台清單頁共用：解析 searchParams → 分頁 / 搜尋 / 排序 */

export type SearchParams = { [k: string]: string | string[] | undefined };

export type ListParams = {
  q: string;
  page: number;
  pageSize: number;
  sort: string | null;
  dir: "asc" | "desc";
};

const one = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export function parseListParams(
  sp: SearchParams,
  opts: { defaultSort?: string; pageSize?: number; sortable?: string[] } = {},
): ListParams {
  const pageSize = opts.pageSize ?? 20;
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const rawSort = one(sp.sort) ?? opts.defaultSort ?? null;
  const sort =
    rawSort && (!opts.sortable || opts.sortable.includes(rawSort))
      ? rawSort
      : (opts.defaultSort ?? null);
  const dir = one(sp.dir) === "asc" ? "asc" : "desc";
  return {
    q: (one(sp.q) ?? "").trim(),
    page,
    pageSize,
    sort,
    dir,
  };
}

/** 產生換頁 / 排序用的 querystring（保留其他既有參數） */
export function buildQuery(
  current: SearchParams,
  patch: Record<string, string | number | null>,
): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    const val = one(v);
    if (val != null && val !== "") usp.set(k, val);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === "") usp.delete(k);
    else usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}
