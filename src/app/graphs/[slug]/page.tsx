import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGraphBySlug, getAllGraphSlugs } from "@/lib/graphs";
import GraphViewer from "@/components/graph/GraphViewer";

interface GraphPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllGraphSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GraphPageProps): Promise<Metadata> {
  const { slug } = await params;
  const graph = getGraphBySlug(slug);
  if (!graph) {
    return { title: "图谱未找到" };
  }
  return {
    title: `知识图谱 - ${slug}`,
    description: `包含 ${graph.nodes.length} 个知识节点的知识图谱`,
  };
}

export default async function GraphPage({ params }: GraphPageProps) {
  const { slug } = await params;
  const graph = getGraphBySlug(slug);

  if (!graph) {
    notFound();
  }

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
        <h1 className="text-2xl font-bold mb-2">知识图谱</h1>
        <p className="text-[var(--color-gray)]">
          包含 {graph.nodes.length} 个节点和 {graph.edges.length} 条连接
        </p>
      </header>

      {/* 使用说明 */}
      <div className="mb-6 p-4 bg-[var(--color-paper-dark)] rounded-lg text-sm">
        <p className="text-[var(--color-gray)]">
          <strong>操作提示：</strong>
          滚轮缩放 · 拖拽平移 · 点击节点查看详情 · 右下角小地图导航
        </p>
      </div>

      {/* 图谱查看器 */}
      <GraphViewer data={graph} />
    </div>
  );
}
