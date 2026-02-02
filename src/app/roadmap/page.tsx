import { Metadata } from "next";
import Link from "next/link";
import { getAllRoadmaps, type RoadmapMeta, type RoadmapStatus } from "@/lib/roadmap";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "我的规划",
  description: "当前正在做的事情和安排",
};

// 规划状态配置
const statusConfig: Record<RoadmapStatus, { label: string; className: string }> = {
  active: {
    label: "进行中",
    className: "bg-[var(--color-vermilion)] text-white",
  },
  completed: {
    label: "已完成",
    className: "bg-green-100 text-green-700",
  },
  paused: {
    label: "已暂停",
    className: "bg-gray-100 text-gray-600",
  },
};

function StatusBadge({ status }: { status: RoadmapStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`text-xs px-2 py-1 rounded ${className}`}>{label}</span>
  );
}

function ProgressBar({ progress }: { progress: RoadmapMeta["progress"] }) {
  if (progress.total === 0) return null;

  const donePercent = (progress.done / progress.total) * 100;
  const inProgressPercent = (progress.inProgress / progress.total) * 100;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-[var(--color-gray)] mb-1">
        <span>{progress.done}/{progress.total} 已完成</span>
        <span>{Math.round(donePercent)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
        {donePercent > 0 && (
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${donePercent}%` }}
          />
        )}
        {inProgressPercent > 0 && (
          <div
            className="h-full bg-[var(--color-vermilion)] transition-all"
            style={{ width: `${inProgressPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap }: { roadmap: RoadmapMeta }) {
  return (
    <Link
      href={`/roadmap/${roadmap.slug}`}
      className="card-hover block rounded-lg p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-lg font-semibold hover:text-[var(--color-vermilion)]">
          {roadmap.name}
        </h3>
        <StatusBadge status={roadmap.status} />
      </div>
      <p className="text-sm text-[var(--color-gray)] mb-2">
        {roadmap.description}
      </p>
      <p className="text-xs text-[var(--color-gray)]">
        创建于 {roadmap.date}
      </p>
      <ProgressBar progress={roadmap.progress} />
    </Link>
  );
}

export default function RoadmapPage() {
  const roadmaps = getAllRoadmaps();
  const activeRoadmaps = roadmaps.filter((r) => r.status === "active");
  const completedRoadmaps = roadmaps.filter((r) => r.status === "completed");
  const pausedRoadmaps = roadmaps.filter((r) => r.status === "paused");

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SectionTitle subtitle="我的学习和开发计划">我的规划</SectionTitle>

      {/* 进行中的规划 */}
      {activeRoadmaps.length > 0 && (
        <section className="mb-12">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--color-vermilion)]" />
            进行中
          </h3>
          <div className="grid gap-4">
            {activeRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.slug} roadmap={roadmap} />
            ))}
          </div>
        </section>
      )}

      {/* 已暂停的规划 */}
      {pausedRoadmaps.length > 0 && (
        <section className="mb-12">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400" />
            已暂停
          </h3>
          <div className="grid gap-4">
            {pausedRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.slug} roadmap={roadmap} />
            ))}
          </div>
        </section>
      )}

      {/* 已完成的规划 */}
      {completedRoadmaps.length > 0 && (
        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            已完成
          </h3>
          <div className="grid gap-4">
            {completedRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.slug} roadmap={roadmap} />
            ))}
          </div>
        </section>
      )}

      {roadmaps.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--color-gray)]">
            暂无规划，敬请期待...
          </p>
          <p className="text-sm text-[var(--color-gray)] mt-2">
            将规划文档放入 content/roadmaps/ 目录即可展示
          </p>
        </div>
      )}
    </div>
  );
}
