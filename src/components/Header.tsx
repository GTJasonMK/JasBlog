"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "开源项目" },
  { href: "/notes", label: "学习笔记" },
  { href: "/graphs", label: "知识图谱" },
  { href: "/roadmap", label: "我的规划" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-paper)] border-b border-[var(--color-paper-darker)]">
      <div className="max-w-4xl mx-auto px-6">
        <nav className="flex items-center justify-between h-14">
          <Link href="/" className="seal text-sm">
            JasBlog
          </Link>
          <ul className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
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
        </nav>
      </div>
    </header>
  );
}
