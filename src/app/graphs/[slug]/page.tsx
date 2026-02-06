import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGraphBySlug, getAllGraphSlugs } from "@/lib/graphs";
import GraphPageClient from "./GraphPageClient";

interface GraphPageProps {
  params: Promise<{ slug: string }>;
}

const EMPTY_STATIC_PARAM = "__empty_static_params__";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllGraphSlugs();
  const staticSlugs = slugs.length > 0 ? slugs : [EMPTY_STATIC_PARAM];
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GraphPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    return { title: "图谱未找到" };
  }

  const graph = getGraphBySlug(slug);
  if (!graph) {
    return { title: "图谱未找到" };
  }
  return {
    title: graph.name,
    description: graph.description || `包含 ${graph.graphData.nodes.length} 个知识节点的知识图谱`,
  };
}

export default async function GraphPage({ params }: GraphPageProps) {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    notFound();
  }

  const graph = getGraphBySlug(slug);

  if (!graph) {
    notFound();
  }

  return <GraphPageClient graph={graph} />;
}
