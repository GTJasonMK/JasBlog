"use client";

import { useState, ReactNode } from "react";

interface CollapseProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Collapse({ title, children, defaultOpen = false }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapse-panel my-4 border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[var(--color-paper-dark)] hover:bg-[var(--color-border)] transition-colors text-left"
      >
        <span className="font-medium text-[var(--color-ink)]">{title}</span>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 bg-[var(--color-paper)]">{children}</div>
      </div>
    </div>
  );
}

// 折叠组组件，用于多个折叠面板
interface CollapseGroupProps {
  children: ReactNode;
  accordion?: boolean; // 手风琴模式，同时只能展开一个
}

export function CollapseGroup({ children, accordion = false }: CollapseGroupProps) {
  return (
    <div className="collapse-group space-y-2">
      {children}
    </div>
  );
}
