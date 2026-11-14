"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { filterNotesByCategory, getTagOptions, UNCATEGORIZED_NOTES } from "@jas/content-core";
import { BackToTop, useContentHost } from "@jas/content-ui";
import { NoteCard, NoteCategoryNavigation } from "@jas/content-ui/lists";
import { SectionIcon } from "./SectionIcon";
import Pagination from "./Pagination";
import { pageHref, paginate } from "@/lib/pagination";
import type { PostMeta } from "@/lib/posts";

function NotesListContent({ posts, search, page }: { posts: PostMeta[]; search: string; page: number }) {
  const router = useRouter();
  const params = new URLSearchParams(search);
  const host = useContentHost();
  const categories = host.noteCategories ?? [];
  const category = params.get("category") ?? "";
  const selectedCategory = categories.find((item) => item.id === category);
  const unknown = !!category && category !== UNCATEGORIZED_NOTES && !selectedCategory;
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoryPanelId = useId();
  const categoryPanel = useRef<HTMLDivElement>(null);
  const categoryTrigger = useRef<HTMLButtonElement>(null);
  const categoryName = selectedCategory?.name ?? (category === UNCATEGORIZED_NOTES ? "未分类" : "全部笔记");
  useEffect(() => {
    if (categoriesOpen) categoryPanel.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [categoriesOpen]);
  const categoryItems = filterNotesByCategory(posts, categories, category);
  const tags = getTagOptions(categoryItems);
  const requestedTag = params.get("tag") ?? "";
  const tag = tags.includes(requestedTag) ? requestedTag : "";
  const filtered = tag ? categoryItems.filter((item) => item.tags.includes(tag)) : categoryItems;
  const pagination = paginate(filtered, page);
  const invalidPage = page > pagination.pageCount;
  const onCategoryChange = (id: string) => {
    if (categoriesOpen) categoryTrigger.current?.focus();
    setCategoriesOpen(false);
    const params = new URLSearchParams(search);
    if (id) params.set("category", id); else params.delete("category");
    params.delete("tag");
    router.push(pageHref("/notes", 1, params.toString()), { scroll: false });
  };

  return <div className="notes-workspace">
      {categories.length > 0 && <aside className="notes-sidebar" data-expanded={categoriesOpen}>
        <div className="notes-sidebar-heading"><h2>内容目录</h2><SectionIcon target="notes" /></div>
        <button ref={categoryTrigger} type="button" className="notes-category-trigger" aria-expanded={categoriesOpen} aria-controls={categoryPanelId} onClick={() => setCategoriesOpen((open) => !open)}><span>分类</span><span>{categoryName}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 6 5 5 5-5" /></svg></button>
        <div ref={categoryPanel} id={categoryPanelId} className="notes-category-panel"><NoteCategoryNavigation categories={categories} selected={category} onChange={onCategoryChange} /></div>
      </aside>}
      <section id="notes-results" className="notes-results" aria-labelledby="notes-results-title" tabIndex={-1}>
        <div className="notes-toolbar"><div className="notes-result-heading"><h2 id="notes-results-title">{categoryName}</h2><span aria-live="polite">{filtered.length} 篇</span></div>
          {tags.length > 0 && <label className="notes-tag-filter"><span>标签</span><select aria-label="按标签筛选" value={tag} onChange={(event) => {
            const params = new URLSearchParams(search);
            if (event.target.value) params.set("tag", event.target.value); else params.delete("tag");
            router.replace(pageHref("/notes", 1, params.toString()), { scroll: false });
          }}><option value="">全部标签</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}
        </div>
        {unknown ? <div className="notes-empty"><p role="alert">这个分类不存在。</p><button type="button" className="btn-primary" onClick={() => onCategoryChange("")}>查看全部笔记</button></div>
          : invalidPage ? <div className="notes-empty"><p role="alert">这个筛选结果没有第 {page} 页。</p><Link href={pageHref("/notes", 1, search)} className="btn-primary">返回第一页</Link></div>
          : filtered.length ? <div className="notes-grid">{pagination.items.map((note) => <NoteCard key={note.slug} note={note} />)}</div>
          : <p className="notes-empty">{tag ? `未找到标签“${tag}”的文章。` : "这个分类下暂无笔记。"}</p>}
        <div className="content-actions">
          {!unknown && !invalidPage && filtered.length > 0 && <Pagination basePath="/notes" anchor="notes-results" label="笔记分页" page={page} pageCount={pagination.pageCount} pages={pagination.pages} search={search} />}
          <BackToTop />
        </div>
      </section>
  </div>;
}

// Isolate the URL hook so hydration preserves the static list.
function NotesQuery({ onChange }: { onChange: (query: string) => void }) {
  const query = useSearchParams().toString();
  useEffect(() => onChange(query), [query, onChange]);
  return null;
}

export default function NotesList({ posts, page }: { posts: PostMeta[]; page: number }) {
  const [query, setQuery] = useState("");
  return <><Suspense fallback={null}><NotesQuery onChange={setQuery} /></Suspense><NotesListContent posts={posts} search={query} page={page} /></>;
}
