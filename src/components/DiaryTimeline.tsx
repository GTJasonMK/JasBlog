"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DiaryDayMeta } from "@/lib/diary";

interface DiaryTimelineProps {
  days: DiaryDayMeta[];
}

function getYear(date: string): string {
  return date.split("-")[0] || "";
}

function getMonth(date: string): string {
  return date.split("-")[1] || "";
}

function getMonthsForYear(days: DiaryDayMeta[], year: string): string[] {
  const options = days
    .filter((day) => year === "all" || getYear(day.date) === year)
    .map((day) => getMonth(day.date))
    .filter(Boolean);

  return Array.from(new Set(options)).sort((a, b) => b.localeCompare(a));
}

export default function DiaryTimeline({ days }: DiaryTimelineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "all");
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || "all");

  const years = useMemo(() => {
    return Array.from(new Set(days.map((day) => getYear(day.date))))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
  }, [days]);

  const syncUrl = useCallback(
    (year: string, month: string) => {
      const currentYear = searchParams.get("year") || "all";
      const currentMonth = searchParams.get("month") || "all";
      if (currentYear === year && currentMonth === month) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (year === "all") {
        params.delete("year");
      } else {
        params.set("year", year);
      }

      if (month === "all") {
        params.delete("month");
      } else {
        params.set("month", month);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const yearFromQuery = searchParams.get("year") || "all";
    const normalizedYear = yearFromQuery === "all" || years.includes(yearFromQuery)
      ? yearFromQuery
      : "all";

    const monthFromQuery = searchParams.get("month") || "all";
    const allowedMonths = getMonthsForYear(days, normalizedYear);
    const normalizedMonth = monthFromQuery === "all" || allowedMonths.includes(monthFromQuery)
      ? monthFromQuery
      : "all";

    setSelectedYear((prev) => (prev === normalizedYear ? prev : normalizedYear));
    setSelectedMonth((prev) => (prev === normalizedMonth ? prev : normalizedMonth));
  }, [searchParams, days, years]);

  const months = useMemo(() => getMonthsForYear(days, selectedYear), [days, selectedYear]);

  useEffect(() => {
    if (selectedMonth === "all") return;
    if (months.includes(selectedMonth)) return;

    setSelectedMonth("all");
    syncUrl(selectedYear, "all");
  }, [months, selectedMonth, selectedYear, syncUrl]);

  const handleYearChange = (nextYearRaw: string) => {
    const nextYear = nextYearRaw === "all" || years.includes(nextYearRaw)
      ? nextYearRaw
      : "all";
    const allowedMonths = getMonthsForYear(days, nextYear);
    const nextMonth = selectedMonth === "all" || allowedMonths.includes(selectedMonth)
      ? selectedMonth
      : "all";

    setSelectedYear(nextYear);
    setSelectedMonth(nextMonth);
    syncUrl(nextYear, nextMonth);
  };

  const handleMonthChange = (nextMonthRaw: string) => {
    const allowedMonths = getMonthsForYear(days, selectedYear);
    const nextMonth = nextMonthRaw === "all" || allowedMonths.includes(nextMonthRaw)
      ? nextMonthRaw
      : "all";

    setSelectedMonth(nextMonth);
    syncUrl(selectedYear, nextMonth);
  };

  const filteredDays = useMemo(() => {
    return days.filter((day) => {
      const year = getYear(day.date);
      const month = getMonth(day.date);
      const yearMatches = selectedYear === "all" || year === selectedYear;
      const monthMatches = selectedMonth === "all" || month === selectedMonth;
      return yearMatches && monthMatches;
    });
  }, [days, selectedYear, selectedMonth]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end gap-4">
        <label className="text-sm text-[var(--color-gray)]">
          <span className="block mb-2">年份</span>
          <select
            value={selectedYear}
            onChange={(event) => handleYearChange(event.target.value)}
            className="bg-white border border-[var(--color-paper-darker)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-vermilion)]"
          >
            <option value="all">全部年份</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-[var(--color-gray)]">
          <span className="block mb-2">月份</span>
          <select
            value={selectedMonth}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="bg-white border border-[var(--color-paper-darker)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-vermilion)]"
          >
            <option value="all">全部月份</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredDays.length > 0 ? (
        <div className="relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-[var(--color-paper-darker)]" />
          <div className="space-y-6">
            {filteredDays.map((day) => (
              <article key={day.slug} className="relative">
                <span className="absolute -left-5 top-8 w-3 h-3 rounded-full bg-[var(--color-vermilion)] border-2 border-[var(--color-paper)]" />
                <Link href={`/diary/${day.slug}`} className="card-hover block rounded-lg p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <time className="text-xs text-[var(--color-gray-light)]">{day.date}</time>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-paper-dark)] text-[var(--color-gray)]">
                      {day.entryCount} 条记录
                    </span>
                    {day.mood && <span className="tag">{day.mood}</span>}
                    {day.weather && <span className="tag">{day.weather}</span>}
                    {day.location && <span className="tag">{day.location}</span>}
                  </div>

                  <h3 className="text-lg font-semibold hover:text-[var(--color-vermilion)] mb-2">
                    {day.title}
                  </h3>

                  {day.excerpt && (
                    <p className="text-sm text-[var(--color-gray)] line-clamp-2">
                      {day.excerpt}
                    </p>
                  )}

                  {day.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {day.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                      {day.tags.length > 4 && (
                        <span className="text-xs px-2 py-0.5 text-[var(--color-gray)]">
                          +{day.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[var(--color-gray)] text-center py-16">
          当前筛选条件下没有考研日志条目。
        </p>
      )}
    </>
  );
}
