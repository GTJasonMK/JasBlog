"use client";

import Link from "next/link";
import GraphViewer from "@/components/graph/GraphViewer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { preprocessAlerts } from "@/lib/preprocess-alerts";
import type { Graph } from "@/types/graph";

interface GraphPageClientProps {
  graph: Graph;
}

export default function GraphPageClient({ graph }: GraphPageClientProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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

      {/* 图谱卡片 — 虚线边框暗示节点连接 */}
      <header className="rounded-2xl bg-[var(--color-paper)] border-2 border-dashed border-[var(--color-gold)]/30 p-8 mb-8">
        <p className="text-xs tracking-[0.16em] uppercase text-[var(--color-gold)] mb-2">知识图谱</p>
        <h1 className="text-2xl font-bold mb-2">{graph.name}</h1>
        {graph.description && (
          <p className="text-[var(--color-gray)] mb-4">{graph.description}</p>
        )}
        {graph.date && (
          <p className="text-sm text-[var(--color-gray)] mb-4">{graph.date}</p>
        )}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-paper-dark)] rounded-lg border-l-3 border-[var(--color-gold)]">
            <span className="text-2xl font-bold text-[var(--color-ink)]">{graph.graphData.nodes.length}</span>
            <span className="text-sm text-[var(--color-gray)]">个节点</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-paper-dark)] rounded-lg border-l-3 border-[var(--color-vermilion)]">
            <span className="text-2xl font-bold text-[var(--color-ink)]">{graph.graphData.edges.length}</span>
            <span className="text-sm text-[var(--color-gray)]">条连接</span>
          </div>
        </div>
      </header>

      <div className="mb-6 p-4 bg-[var(--color-paper-dark)] rounded-lg text-sm">
        <p className="text-[var(--color-gray)]">
          <strong>操作提示：</strong>
          滚轮缩放 · 拖拽平移 · 点击节点查看详情 · 右下角小地图导航
        </p>
      </div>

      {graph.error && (
        <div className="mb-6 p-4 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-sm">
          <p className="font-medium text-[var(--color-danger)] mb-1">图谱数据错误</p>
          <p className="text-[var(--color-gray)]">{graph.error}</p>
          <p className="text-xs text-[var(--color-gray)] mt-2">
            请确认文件包含 <span className="font-mono">```graph</span> 代码块，且 JSON 至少包含 nodes/edges 字段。
          </p>
        </div>
      )}

      {!graph.error && <GraphViewer data={graph.graphData} />}

      {graph.content.trim() && (
        <div className="prose-chinese mt-8">
          <MarkdownRenderer content={preprocessAlerts(graph.content)} />
        </div>
      )}
    </div>
  );
}
