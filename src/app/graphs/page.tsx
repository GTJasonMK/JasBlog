import { Metadata } from "next";
import Link from "next/link";
import { getAllGraphs } from "@/lib/graphs";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "知识图谱",
  description: "可视化的知识体系结构",
};

export default function GraphsPage() {
  const graphs = getAllGraphs();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SectionTitle subtitle="可视化的知识体系">知识图谱</SectionTitle>

      {graphs.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {graphs.map((graph) => (
            <Link
              key={graph.slug}
              href={`/graphs/${graph.slug}`}
              className="card-hover block rounded-lg p-6"
            >
              {/* 图谱预览图标 */}
              <div className="w-12 h-12 mb-4 rounded-lg bg-[var(--color-vermilion)]/10 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-vermilion)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="18" r="3" />
                  <path d="M6 9v6M9 6h6M18 9v6M9 18h6" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold mb-2 hover:text-[var(--color-vermilion)]">
                {graph.name}
              </h3>
              <p className="text-[var(--color-gray)] text-sm mb-3">
                {graph.description}
              </p>

              {/* 统计信息 */}
              <div className="flex flex-wrap gap-4 text-xs text-[var(--color-gray)]">
                {graph.date && <span>{graph.date}</span>}
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {graph.nodeCount} 个节点
                </span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                  </svg>
                  {graph.edgeCount} 条连接
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-paper-dark)] flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-gray)"
              strokeWidth="1.5"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M6 9v6M9 6h6M18 9v6M9 18h6" />
            </svg>
          </div>
          <p className="text-[var(--color-gray)]">
            暂无知识图谱，敬请期待...
          </p>
          <p className="text-sm text-[var(--color-gray)] mt-2">
            将图谱 Markdown 文件放入 content/graphs/ 目录即可展示
          </p>
        </div>
      )}
    </div>
  );
}
