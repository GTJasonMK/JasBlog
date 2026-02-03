import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGraphBySlug, getAllGraphSlugs } from "@/lib/graphs";
import GraphPageClient from "./GraphPageClient";

interface GraphPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

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

  return <GraphPageClient graph={graph} />;
}
