import Link from "next/link";
import { pageHref } from "@/lib/pagination";

export default function Pagination({ page, pageCount, pages, search = "", basePath, anchor, label }: {
  page: number; pageCount: number; pages: number[]; search?: string; basePath: string; anchor: string; label: string;
}) {
  if (pageCount <= 1) return null;
  const href = (value: number) => `${pageHref(basePath, value, search)}#${anchor}`;

  return <nav className="content-pagination" aria-label={label}>
    {page > 1 ? <Link href={href(page - 1)} prefetch={false} rel="prev">上一页</Link> : <span aria-disabled="true">上一页</span>}
    <ol>{pages.map((value, index) => <li key={value}>
      {index > 0 && value - pages[index - 1] > 1 && <span className="pagination-gap" aria-hidden="true">…</span>}
      {page === value ? <span aria-current="page" aria-label={`第 ${value} 页`}>{value}</span>
        : <Link href={href(value)} prefetch={false} aria-label={`第 ${value} 页`}>{value}</Link>}
    </li>)}</ol>
    {page < pageCount ? <Link href={href(page + 1)} prefetch={false} rel="next">下一页</Link> : <span aria-disabled="true">下一页</span>}
  </nav>;
}
