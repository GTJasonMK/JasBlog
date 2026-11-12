"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DiaryTimelineView } from "@jas/content-ui/lists";
import type { DiaryDayMeta } from "@/lib/diary";

export default function DiaryTimeline({ days }: { days: DiaryDayMeta[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  return <DiaryTimelineView days={days} year={search.get("year") ?? "all"} month={search.get("month") ?? "all"} onFilterChange={(year, month) => {
    const params = new URLSearchParams(search.toString());
    for (const [key, value] of [["year", year], ["month", month]]) { if (value === "all") params.delete(key); else params.set(key, value); }
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  }} />;
}
