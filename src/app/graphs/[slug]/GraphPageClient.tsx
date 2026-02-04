"use client";

import Link from "next/link";
import GraphViewer from "@/components/graph/GraphViewer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Graph } from "@/types/graph";

interface GraphPageClientProps {
  graph: Graph;
}

export default function GraphPageClient({ graph }: GraphPageClientProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* 返回链接 */}
      <Link
        href="/graphs"
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
        返回图谱列表
      </Link>

      {/* 标题 */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{graph.name}</h1>
        {graph.description && (
          <p className="text-[var(--color-gray)] mb-2">{graph.description}</p>
        )}
        <p className="text-sm text-[var(--color-gray)]">
          {graph.date && <span className="mr-4">{graph.date}</span>}
          <span>{graph.graphData.nodes.length} 个节点</span>
          <span className="mx-2">·</span>
          <span>{graph.graphData.edges.length} 条连接</span>
        </p>
      </header>

      {/* 正文内容 */}
      {graph.content.trim() && (
        <div className="prose-chinese mb-8">
          <MarkdownRenderer content={graph.content} />
        </div>
      )}

      {/* 使用说明 */}
      <div className="mb-6 p-4 bg-[var(--color-paper-dark)] rounded-lg text-sm">
        <p className="text-[var(--color-gray)]">
          <strong>操作提示：</strong>
          滚轮缩放 · 拖拽平移 · 点击节点查看详情 · 右下角小地图导航
        </p>
      </div>

      {/* 图谱查看器 */}
      <GraphViewer data={graph.graphData} />
    </div>
  );
}
