import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllDiaryDays } from "@/lib/diary";
import DiaryTimeline from "@/components/DiaryTimeline";

import { sectionEnabled, sectionMetadata } from "@/lib/site";
export function generateMetadata() { return sectionMetadata("diary"); }

export default function DiaryPage() {
  if (!sectionEnabled("diary")) notFound();
  const days = getAllDiaryDays();

  return (
        <Suspense fallback={<div>加载中...</div>}>
          <DiaryTimeline days={days} />
        </Suspense>
  );
}
