"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  if (typeof document === "undefined") return "";
  const meta = document.querySelector('meta[name="base-path"]') as HTMLMetaElement | null;
  return meta?.content || "";
}

async function loadPagefind(): Promise<Pagefind> {
  const existing = (globalThis as unknown as { pagefind?: Pagefind }).pagefind;
  if (existing) return existing;

  if (!pagefindLoadPromise) {
    pagefindLoadPromise = new Promise<Pagefind>((resolve, reject) => {
      const basePath = getBasePathFromMeta();
      const script = document.createElement("script");
      script.src = `${basePath}/pagefind/pagefind.js`;
      script.async = true;
      script.onload = () => {
        const loaded = (globalThis as unknown as { pagefind?: Pagefind }).pagefind;
        if (!loaded) {
          reject(new Error("Pagefind 脚本加载成功但未找到 pagefind 对象"));
          return;
        }
        resolve(loaded);
      };
      script.onerror = () => {
        reject(new Error("Pagefind 脚本加载失败，请先运行 npm run build 生成索引"));
      };
      document.head.appendChild(script);
    });
  }

  return pagefindLoadPromise;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "开源项目" },
  { href: "/notes", label: "学习笔记" },
  { href: "/graphs", label: "知识图谱" },
  { href: "/roadmap", label: "我的规划" },
];

export default function Header() {
  const pathname = usePathname();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isActivePath = useMemo(() => {
    return (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  }, [pathname]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchItems([]);
    setSearchError(null);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    closeSearch();
  }, [pathname, closeSearch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      if (event.key === "Escape") {
        if (!isSearchOpen) return;
        event.preventDefault();
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const query = searchQuery.trim();
    if (!query) {
      setSearchItems([]);
      setSearchError(null);
      return;
    }

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

            return { url, title, excerpt } satisfies SearchItem;
          })
          .filter((item): item is SearchItem => Boolean(item));

        setSearchItems(mapped);
      } catch (err) {
        const message = err instanceof Error ? err.message : "搜索失败";
        setSearchItems([]);
        setSearchError(message);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [isSearchOpen, searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-paper)] border-b border-[var(--color-paper-darker)]">
      {isSearchOpen && (
        <button
          type="button"
          aria-label="关闭搜索"
          className="fixed inset-0 z-40 cursor-default bg-black/10"
          onClick={closeSearch}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 relative">
        <nav className="flex items-center justify-between h-14">
          <Link href="/" className="seal text-sm">
            JasBlog
          </Link>
          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-sm ${
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

            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="text-sm text-[var(--color-gray)] hover:text-[var(--color-ink)] px-2 py-1 rounded-md border border-transparent hover:border-[var(--color-paper-darker)] transition-colors"
              aria-label="打开搜索（快捷键 /）"
            >
              <span className="hidden sm:inline">搜索</span>
              <span className="sm:hidden">/</span>
            </button>
          </div>
        </nav>

        {/* Header 搜索弹窗：在固定区域自动展开/收起 */}
        <div
          className={`absolute left-0 right-0 top-14 z-50 transition-all duration-200 ease-out ${
            isSearchOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="bg-[var(--color-paper)] border border-[var(--color-paper-darker)] rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-3">
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索笔记 / 项目 / 图谱 / 规划（快捷键 /）"
                className="flex-1 bg-white border border-[var(--color-paper-darker)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-vermilion)]"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="text-xs px-2 py-2 rounded-md text-[var(--color-gray)] hover:text-[var(--color-ink)] border border-transparent hover:border-[var(--color-paper-darker)] transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="mt-3">
              {searchError && (
                <p className="text-sm text-[var(--color-gray)]">
                  {searchError}
                </p>
              )}

              {!searchError && isSearching && (
                <p className="text-sm text-[var(--color-gray)]">搜索中...</p>
              )}

              {!searchError && !isSearching && searchQuery.trim() && searchItems.length === 0 && (
                <p className="text-sm text-[var(--color-gray)]">未找到相关内容</p>
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

            <div className="mt-3 text-xs text-[var(--color-gray)]">
              提示：按 <span className="font-mono">/</span> 打开搜索，按 <span className="font-mono">ESC</span> 关闭
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
