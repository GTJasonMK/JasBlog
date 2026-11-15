"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { contentHref } from "@/lib/content-routes";
import type { CollectionDocument, ContentCollection } from "@jas/content-core";

export default function CollectionBrowser({ collection, items }: { collection: ContentCollection; items: CollectionDocument[] }) {
  const page = Math.max(1, Number(useSearchParams().get("page") ?? "1") || 1);
  const count = Math.max(1, Math.ceil(items.length / collection.pageSize));
  const safePage = Math.min(page, count);
  const visible = items.slice((safePage - 1) * collection.pageSize, safePage * collection.pageSize);
  return <div className="notes-directory"><div className="notes-workspace"><section className="notes-results" id="collection-results"><div className="notes-toolbar"><div className="notes-result-heading"><h1>{collection.title}</h1><span>{items.length} 项</span></div><p className="text-sm text-[var(--color-text-muted)]">{collection.description}</p></div>{visible.length ? <div className="notes-grid">{visible.map((item) => <article key={`${item.type}:${item.slug}`} className="card-hover rounded-lg p-6"><div className="mb-2 flex flex-wrap items-center gap-3"><span className="text-xs text-[var(--color-text-subtle)]">{item.type}</span>{item.date && <time className="text-xs text-[var(--color-text-subtle)]">{item.date}</time>}{item.tags?.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div><h2 className="mb-2 text-lg font-semibold break-words"><Link href={contentHref(item.type, item.slug)} className="hover:text-[var(--color-primary)]">{item.title}</Link></h2>{(item as CollectionDocument & { excerpt?: string }).excerpt && <p className="text-sm text-[var(--color-text-muted)]">{(item as CollectionDocument & { excerpt?: string }).excerpt}</p>}</article>)}</div> : <p className="notes-empty">暂无内容。</p>}<div className="content-actions">{count > 1 && <nav aria-label={`${collection.title}分页`} className="pagination">{Array.from({ length: count }, (_, index) => index + 1).map((value) => <Link key={value} href={`/collections/${collection.slug}?page=${value}`} aria-current={value === safePage ? "page" : undefined}>{value}</Link>)}</nav>}</div></section></div></div>;
}
