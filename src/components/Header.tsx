"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchItem {
  url: string;
  title: string;
  excerpt: string;
}

type Pagefind = {
  search: (query: string) => Promise<{
    results: Array<{ data: () => Promise<Record<string, unknown>> }>;
  }>;
};

let pagefindLoadPromise: Promise<Pagefind> | null = null;

function getBasePathFromMeta(): string {
  const meta = document.querySelector('meta[name="base-path"]') as HTMLMetaElement | null;
  if (!meta) throw new Error("页面缺少 base-path 配置。");
  return meta.content;
}

async function loadPagefind(): Promise<Pagefind> {
  if (!pagefindLoadPromise) {
    const basePath = getBasePathFromMeta();
    pagefindLoadPromise = import(/* webpackIgnore: true */ `${basePath}/pagefind/pagefind.js`) as Promise<Pagefind>;
  }

  try {
    return await pagefindLoadPromise;
  } catch (error) {
    pagefindLoadPromise = null;
    throw error;
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

export default function Header({ name, navItems }: { name: string; navItems: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navButtonRef = useRef<HTMLButtonElement>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchRequestIdRef = useRef(0);

  const isActivePath = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const closeSearch = useCallback(() => {
    searchRequestIdRef.current += 1;
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchItems([]);
    setIsSearching(false);
    setSearchError(null);
  }, []);

  const dismissSearch = useCallback(() => {
    closeSearch();
    searchButtonRef.current?.focus();
  }, [closeSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    closeSearch();
    setIsNavOpen(false);
  }, [pathname, closeSearch]);

  useEffect(() => {
    if (isNavOpen) document.getElementById("site:primary-navigation")?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [isNavOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || document.querySelector("dialog[open]")) return;
      if (event.key === "/") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        setIsNavOpen(false);
        setIsSearchOpen(true);
        return;
      }

      if (event.key === "Escape") {
        if (isNavOpen) {
          event.preventDefault();
          setIsNavOpen(false);
          navButtonRef.current?.focus();
          return;
        }
        if (!isSearchOpen) return;
        event.preventDefault();
        dismissSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, isNavOpen, dismissSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const query = searchQuery.trim();
    if (!query) {
      searchRequestIdRef.current += 1;
      setSearchItems([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const requestId = ++searchRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const pagefind = await loadPagefind();
        const result = await pagefind.search(query);

        const dataList = await Promise.all(
          result.results.slice(0, 12).map(async (item) => item.data())
        );

        const mapped = dataList
          .map((data) => {
            const url = String(data.url || "");
            const meta = data.meta as Record<string, unknown> | undefined;
            const title = String(meta?.title || data.title || url);
            const excerpt = String(data.excerpt || "");

            if (!url || url.includes("__empty_static_params__")) {
              return null;
            }

            const basePath = getBasePathFromMeta();
            const internal = basePath && (url === basePath || url.startsWith(basePath + "/")) ? url.slice(basePath.length) || "/" : url;
            const href = internal.replace(/^\/index\.html(?=$|[?#])/, "/").replace(/\.html(?=$|[?#])/, "");
            return { url: href, title, excerpt } satisfies SearchItem;
          })
          .filter((item): item is SearchItem => Boolean(item));

        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        setSearchItems(mapped);
      } catch (err) {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        const message = err instanceof Error ? err.message : "搜索失败。";
        setSearchItems([]);
        setSearchError(message);
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [isSearchOpen, searchQuery]);

  return (
    <header className="site-header sticky top-0 z-50 bg-[var(--color-paper)] border-b border-[var(--color-paper-darker)]"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsNavOpen(false); }}>
      {isNavOpen && <button type="button" aria-label="关闭导航菜单" className="fixed inset-0 z-40 cursor-default bg-black/10" onClick={() => setIsNavOpen(false)} />}
      {isSearchOpen && (
        <button
          type="button"
          aria-label="关闭搜索"
          className="fixed inset-0 z-40 cursor-default bg-black/10"
          onClick={dismissSearch}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-50">
        <nav aria-label="主导航" className="flex items-center justify-between gap-3 min-h-14 py-1">
          <Link href="/" className="seal text-sm min-w-0 max-w-[50%] lg:max-w-48 [overflow-wrap:anywhere]">
            {name}
          </Link>

            <ul id="site:primary-navigation" className={`${isNavOpen ? "grid" : "hidden"} absolute left-0 right-0 top-full z-50 grid-cols-2 gap-2 border-b border-[var(--color-paper-darker)] bg-[var(--color-paper)] p-4 lg:static lg:flex lg:flex-wrap lg:flex-1 lg:min-w-0 lg:justify-center lg:items-center lg:gap-x-5 lg:gap-y-0 lg:border-0 lg:p-0`}>
              {navItems.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <li key={item.href} className="min-w-0 max-w-full">
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsNavOpen(false)}
                      className={`flex min-h-11 min-w-11 items-center px-2 text-sm [overflow-wrap:anywhere] lg:max-w-48 lg:justify-center lg:px-0 ${
                        isActive
                          ? "text-[var(--color-vermilion)] font-medium"
                          : "text-[var(--color-gray)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

          <div className="flex shrink-0 items-center gap-2">
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => { setIsNavOpen(false); if (isSearchOpen) closeSearch(); else setIsSearchOpen(true); }}
              className="min-h-[44px] min-w-[44px] text-sm text-[var(--color-gray)] hover:text-[var(--color-ink)] px-2 py-1 rounded-md border border-transparent hover:border-[var(--color-paper-darker)] transition-colors"
              aria-label="打开搜索（快捷键：/）"
              aria-expanded={isSearchOpen}
              aria-controls="site:search"
            >
              <span className="hidden sm:inline">搜索</span>
              <span className="sm:hidden">/</span>
            </button>
            <button ref={navButtonRef} type="button" className="grid min-h-[44px] min-w-[44px] place-items-center lg:hidden"
              aria-expanded={isNavOpen} aria-controls="site:primary-navigation" aria-label={isNavOpen ? "收起导航" : "展开导航"}
              onClick={() => { closeSearch(); setIsNavOpen((open) => !open); }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={isNavOpen ? "m6 6 12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
            </button>
          </div>
        </nav>

        <div
          id="site:search"
          role="search"
          aria-label="站内搜索"
          hidden={!isSearchOpen}
          className="absolute left-0 right-0 top-full z-50"
        >
          <div className="bg-[var(--color-paper)] border border-[var(--color-paper-darker)] rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-3">
              <input
                aria-label="搜索站点内容"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索内容"
                className="min-w-0 flex-1 bg-white border border-[var(--color-paper-darker)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-vermilion)]"
              />
              <button
                type="button"
                onClick={dismissSearch}
                className="min-h-[44px] min-w-[44px] shrink-0 text-sm px-2 py-2 rounded-md text-[var(--color-gray)] hover:text-[var(--color-ink)] border border-transparent hover:border-[var(--color-paper-darker)] transition-colors"
              >
                关闭
              </button>
            </div>

            <div className="mt-3">
              {searchError && (
                <p className="text-sm text-[var(--color-gray)]">{searchError}</p>
              )}

              {!searchError && isSearching && (
                <p className="text-sm text-[var(--color-gray)]">搜索中...</p>
              )}

              {!searchError &&
                !isSearching &&
                searchQuery.trim() &&
                searchItems.length === 0 && (
                  <p className="text-sm text-[var(--color-gray)]">没有找到结果。</p>
                )}

              {searchItems.length > 0 && (
                <ul className="mt-2 max-h-[60vh] overflow-auto divide-y divide-[var(--color-paper-darker)]">
                  {searchItems.map((item) => (
                    <li key={item.url} className="py-3">
                      <Link
                        href={item.url}
                        className="block hover:text-[var(--color-vermilion)]"
                        onClick={closeSearch}
                      >
                        <div className="text-sm font-medium">{item.title}</div>
                        {item.excerpt && (
                          <div
                            className="text-sm text-[var(--color-gray)] mt-1"
                            dangerouslySetInnerHTML={{ __html: item.excerpt }}
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
      <noscript><nav aria-label="页面导航" className="mx-auto flex max-w-4xl flex-wrap gap-x-6 gap-y-1 px-6 py-3 lg:hidden">
        {navItems.map((item) => <Link key={item.href} href={item.href} className="py-2 text-sm">{item.label}</Link>)}
      </nav></noscript>
    </header>
  );
}
