"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { extractHeadingsFromContent, type HeadingItem } from "@/lib/heading-content";

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [items, setItems] = useState<HeadingItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setItems(extractHeadingsFromContent(content));

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (activeId && activeItemRef.current && navRef.current) {
      const nav = navRef.current;
      const activeItem = activeItemRef.current;

      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      const itemTop = itemRect.top - navRect.top + nav.scrollTop;
      const itemBottom = itemTop + itemRect.height;
      const navVisibleTop = nav.scrollTop;
      const navVisibleBottom = navVisibleTop + nav.clientHeight;

      if (itemTop < navVisibleTop + 40) {
        nav.scrollTo({
          top: Math.max(0, itemTop - 60),
          behavior: "smooth",
        });
      } else if (itemBottom > navVisibleBottom - 40) {
        nav.scrollTo({
          top: itemBottom - nav.clientHeight + 60,
          behavior: "smooth",
        });
      }
    }
  }, [activeId]);

  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      const headingElements = items
        .map((item) => ({
          id: item.id,
          element: document.getElementById(item.id),
        }))
        .filter((item) => item.element !== null);

      const scrollTop = window.scrollY;
      const offset = 100;

      let currentId = "";
      for (const { id, element } of headingElements) {
        if (element && element.offsetTop <= scrollTop + offset) {
          currentId = id;
        }
      }

      if (scrollTop < 100 && headingElements.length > 0) {
        currentId = headingElements[0].id;
      }

      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, activeId]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
        setActiveId(id);
      }
    },
    []
  );

  if (items.length === 0) return null;

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const progressIndex = activeIndex >= 0 ? activeIndex : 0;
  const progress = items.length > 1 ? (progressIndex / (items.length - 1)) * 100 : 0;

  return (
    <nav
      ref={navRef}
      className={`hidden lg:block fixed right-8 top-32 w-56 max-h-[60vh] overflow-y-auto toc-scrollbar transition-all duration-500 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--color-paper-darker) transparent",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-[var(--color-ink)]">目录</h4>
        <span className="text-xs text-[var(--color-gray)]">
          {activeIndex >= 0 ? activeIndex + 1 : 0}/{items.length}
        </span>
      </div>

      <div className="h-0.5 bg-[var(--color-paper-darker)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[var(--color-vermilion)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="space-y-1 text-sm relative">
        <li
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-paper-darker)] rounded-full"
        />

        {items.map((item, index) => {
          const isActive = activeId === item.id;
          const isPassed = activeIndex >= 0 && index <= activeIndex;

          return (
            <li
              key={item.id}
              className="relative"
              style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
            >
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--color-vermilion)] scale-125"
                    : isPassed
                    ? "bg-[var(--color-vermilion)] opacity-50"
                    : "bg-[var(--color-paper-darker)]"
                }`}
                style={{ marginLeft: "-3px" }}
              />

              <a
                ref={isActive ? activeItemRef : null}
                href={`#${item.id}`}
                className={`block py-1.5 pl-4 pr-2 rounded-r transition-all duration-200 ${
                  isActive
                    ? "text-[var(--color-vermilion)] bg-[var(--color-vermilion)]/5 font-medium"
                    : isPassed
                    ? "text-[var(--color-ink-light)]"
                    : "text-[var(--color-gray)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)]"
                }`}
                onClick={(event) => handleClick(event, item.id)}
              >
                <span
                  className={`block truncate transition-transform duration-200 ${
                    isActive ? "translate-x-1" : ""
                  }`}
                >
                  {item.text}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-paper-darker)]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex-1 text-xs py-1.5 text-[var(--color-gray)] hover:text-[var(--color-vermilion)] hover:bg-[var(--color-paper-dark)] rounded transition-colors"
          title="滚动到顶部"
        >
          顶部
        </button>
        <button
          onClick={() =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            })
          }
          className="flex-1 text-xs py-1.5 text-[var(--color-gray)] hover:text-[var(--color-vermilion)] hover:bg-[var(--color-paper-dark)] rounded transition-colors"
          title="滚动到底部"
        >
          底部
        </button>
      </div>
    </nav>
  );
}
