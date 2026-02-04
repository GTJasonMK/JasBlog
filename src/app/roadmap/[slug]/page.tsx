import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoadmapBySlug, getAllRoadmapSlugs, type RoadmapItem, type RoadmapStatus } from "@/lib/roadmap";

interface RoadmapPageProps {
  params: Promise<{ slug: string }>;
}

// 禁止动态路由，只生成 generateStaticParams 返回的页面
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllRoadmapSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);
  if (!roadmap) {
    return { title: "规划未找到" };
  }
  return {
    title: roadmap.name,
    description: roadmap.description,
  };
}

// 状态配置
const statusConfig = {
  todo: {
    label: "待开始",
    className: "bg-gray-100 text-gray-600",
  },
  in_progress: {
    label: "进行中",
    className: "bg-[var(--color-vermilion)] text-white",
  },
  done: {
    label: "已完成",
    className: "bg-green-100 text-green-700",
  },
};

const roadmapStatusConfig: Record<RoadmapStatus, { label: string; className: string }> = {
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

// 优先级配置
const priorityConfig = {
  high: { className: "bg-[var(--color-vermilion)]", label: "高" },
  medium: { className: "bg-[var(--color-gold)]", label: "中" },
  low: { className: "bg-gray-300", label: "低" },
};

function StatusBadge({ status }: { status: RoadmapItem["status"] }) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`text-xs px-2 py-1 rounded ${className}`}>{label}</span>
  );
}

function PriorityIndicator({ priority }: { priority: RoadmapItem["priority"] }) {
  return <span className={`w-2 h-2 rounded-full ${priorityConfig[priority].className}`} />;
}

function ItemCard({ item }: { item: RoadmapItem }) {
  return (
    <div className="card-hover bg-white rounded-lg p-5 border border-[var(--color-paper-dark)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PriorityIndicator priority={item.priority} />
          <h4 className="font-medium">{item.title}</h4>
        </div>
        <StatusBadge status={item.status} />
      </div>
      {item.description && (
        <p className="text-sm text-[var(--color-gray)] mt-2 ml-5">
          {item.description}
        </p>
      )}
      {(item.deadline || item.completedAt) && (
        <div className="flex flex-wrap gap-4 text-xs text-[var(--color-gray)] mt-2 ml-5">
          {item.deadline && (
            <span>截止: {item.deadline}</span>
          )}
          {item.completedAt && (
            <span className="text-green-600">完成: {item.completedAt}</span>
          )}
        </div>
      )}
    </div>
  );
}

// 简单的 Markdown 渲染
function renderMarkdown(content: string): string {
  if (!content.trim()) return "";
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) {
        const text = line.slice(3);
        return `<h2 class="text-xl font-bold mt-8 mb-4">${text}</h2>`;
      }
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        return `<h3 class="text-lg font-semibold mt-6 mb-3">${text}</h3>`;
      }
      if (line.startsWith("- ")) {
        return `<li class="ml-4">${line.slice(2)}</li>`;
      }
      if (line.trim() === "") {
        return "";
      }
      return `<p class="mb-2">${line}</p>`;
    })
    .join("");
}

export default async function RoadmapDetailPage({ params }: RoadmapPageProps) {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);

  if (!roadmap) {
    notFound();
  }

  const inProgress = roadmap.items.filter((item) => item.status === "in_progress");
  const todo = roadmap.items.filter((item) => item.status === "todo");
  const done = roadmap.items.filter((item) => item.status === "done");

  // 计算进度
  const total = roadmap.items.length;
  const doneCount = done.length;
  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* 返回链接 */}
      <Link
        href="/roadmap"
        className="inline-flex items-center gap-1 text-[var(--color-gray)] hover:text-[var(--color-vermilion)] mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        返回规划列表
      </Link>

      {/* 标题区域 */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{roadmap.name}</h1>
          <span className={`text-xs px-2 py-1 rounded ${roadmapStatusConfig[roadmap.status].className}`}>
            {roadmapStatusConfig[roadmap.status].label}
          </span>
        </div>
        <p className="text-[var(--color-gray)] mb-4">{roadmap.description}</p>

        {/* 进度条 */}
        {total > 0 && (
          <div className="bg-[var(--color-paper-dark)] rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--color-gray)]">完成进度</span>
              <span className="font-medium">{doneCount}/{total} ({progressPercent}%)</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* 正文内容 */}
      {roadmap.content.trim() && (
        <div className="prose-chinese mb-8">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(roadmap.content) }} />
        </div>
      )}

      <div className="divider-cloud my-8" />

      {/* 任务列表 */}
      {/* 进行中 */}
      {inProgress.length > 0 && (
        <section className="mb-10">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--color-vermilion)]" />
            正在进行 ({inProgress.length})
          </h3>
          <div className="grid gap-3">
            {inProgress.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 待开始 */}
      {todo.length > 0 && (
        <section className="mb-10">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-300" />
            计划中 ({todo.length})
          </h3>
          <div className="grid gap-3">
            {todo.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 已完成 */}
      {done.length > 0 && (
        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            已完成 ({done.length})
          </h3>
          <div className="grid gap-3">
            {done.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {roadmap.items.length === 0 && (
        <p className="text-[var(--color-gray)] text-center py-12">
          暂无任务项
        </p>
      )}
    </div>
  );
}
