import { RoadmapView } from "@jas/content-ui/views";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRoadmapBySlug,
  getAllRoadmapSlugs,
} from "@/lib/roadmap";

interface RoadmapPageProps {
  params: Promise<{ slug: string }>;
}

const EMPTY_STATIC_PARAM = "__empty_static_params__";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllRoadmapSlugs();
  const staticSlugs = slugs.length > 0 ? slugs : [EMPTY_STATIC_PARAM];
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    return { title: "规划未找到" };
  }

  const roadmap = getRoadmapBySlug(decodeURIComponent(slug));
  if (!roadmap) {
    return { title: "规划未找到" };
  }

  return {
    title: roadmap.title,
    description: roadmap.description,
  };
}

export default async function RoadmapDetailPage({ params }: RoadmapPageProps) {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    notFound();
  }

  const roadmap = getRoadmapBySlug(decodeURIComponent(slug));

  if (!roadmap) {
    notFound();
  }
  return <RoadmapView roadmap={roadmap} back={<Link href="/roadmap" className="text-sm text-[var(--color-text-muted)] mb-6 inline-block">← 返回规划列表</Link>} />;
}
