import { Metadata } from "next";
import { Suspense } from "react";
import { getAllDiaryDays } from "@/lib/diary";
import SectionTitle from "@/components/SectionTitle";
import DiaryTimeline from "@/components/DiaryTimeline";

export const metadata: Metadata = {
  title: "考研日志",
  description: "按天聚合的考研日志时间线。",
};

export default function DiaryPage() {
  const days = getAllDiaryDays();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SectionTitle subtitle="按天聚合的考研日志时间线。">考研日志</SectionTitle>

      {days.length > 0 ? (
        <Suspense fallback={<div>加载中...</div>}>
          <DiaryTimeline days={days} />
        </Suspense>
      ) : (
        <div className="text-center py-16">
          <p className="text-[var(--color-gray)]">暂无考研日志条目。</p>
          <p className="text-sm text-[var(--color-gray)] mt-2">
            将 Markdown 文件放入 `content/diary/YYYY/MM` 即可展示
          </p>
        </div>
      )}
    </div>
  );
}
