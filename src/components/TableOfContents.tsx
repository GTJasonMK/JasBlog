"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [items, setItems] = useState<TocItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  // 从 Markdown 内容中提取标题
  useEffect(() => {
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const headings: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u4e00-\u9fa5-]/g, "");
      headings.push({ id, text, level });
    }

    setItems(headings);

    // 延迟显示，添加入场动画
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [content]);

  // 当 activeId 改变时，滚动目录使当前项可见
  useEffect(() => {
    if (activeId && activeItemRef.current && navRef.current) {
      const nav = navRef.current;
      const activeItem = activeItemRef.current;

      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      // 计算相对位置
      const itemTop = itemRect.top - navRect.top + nav.scrollTop;
      const itemBottom = itemTop + itemRect.height;
      const navVisibleTop = nav.scrollTop;
      const navVisibleBottom = navVisibleTop + nav.clientHeight;

      // 如果当前项不在可视区域内，滚动到合适位置
      if (itemTop < navVisibleTop + 40) {
        // 项目在上方，滚动使其显示在顶部附近
        nav.scrollTo({
          top: Math.max(0, itemTop - 60),
          behavior: "smooth",
        });
      } else if (itemBottom > navVisibleBottom - 40) {
        // 项目在下方，滚动使其显示在底部附近
        nav.scrollTo({
          top: itemBottom - nav.clientHeight + 60,
          behavior: "smooth",
        });
      }
    }
  }, [activeId]);

  // 监听滚动，高亮当前标题
  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      const headingElements = items
        .map((item) => ({
          id: item.id,
          element: document.getElementById(item.id),
        }))
        .filter((item) => item.element !== null);

      // 找到当前可视区域内最靠近顶部的标题
      const scrollTop = window.scrollY;
      const offset = 100; // 偏移量，提前切换

      let currentId = "";
      for (const { id, element } of headingElements) {
        if (element && element.offsetTop <= scrollTop + offset) {
          currentId = id;
        }
      }

      // 如果滚动到顶部，显示第一个标题
      if (scrollTop < 100 && headingElements.length > 0) {
        currentId = headingElements[0].id;
      }

      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    // 初始化时执行一次
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, activeId]);

  // 点击跳转
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
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

  // 计算当前阅读进度
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const progress = items.length > 1 ? (activeIndex / (items.length - 1)) * 100 : 0;

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
      {/* 标题和进度 */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-[var(--color-ink)]">目录</h4>
        <span className="text-xs text-[var(--color-gray)]">
          {activeIndex + 1}/{items.length}
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-0.5 bg-[var(--color-paper-darker)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[var(--color-vermilion)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 目录列表 */}
      <ul className="space-y-1 text-sm relative">
        {/* 左侧进度线 */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-paper-darker)] rounded-full" />

        {items.map((item, index) => {
          const isActive = activeId === item.id;
          const isPassed = activeIndex >= 0 && index <= activeIndex;

          return (
            <li
              key={item.id}
              className="relative"
              style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
            >
              {/* 进度指示点 */}
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
                onClick={(e) => handleClick(e, item.id)}
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

      {/* 快速跳转按钮 */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-paper-darker)]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex-1 text-xs py-1.5 text-[var(--color-gray)] hover:text-[var(--color-vermilion)] hover:bg-[var(--color-paper-dark)] rounded transition-colors"
          title="回到顶部"
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
          title="跳到底部"
        >
          底部
        </button>
      </div>
    </nav>
  );
}
