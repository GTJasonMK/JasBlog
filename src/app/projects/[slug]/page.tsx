import { ProjectView } from "@jas/content-ui/views";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

const EMPTY_STATIC_PARAM = "__empty_static_params__";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  const staticSlugs = slugs.length > 0 ? slugs : [EMPTY_STATIC_PARAM];
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    return { title: "项目未找到" };
  }

  const project = getProjectBySlug(decodeURIComponent(slug));
  if (!project) {
    return { title: "项目未找到" };
  }

  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    notFound();
  }

  const project = getProjectBySlug(decodeURIComponent(slug));
  if (!project) {
    notFound();
  }
  return <ProjectView project={project} back={<Link href="/projects" className="text-sm text-[var(--color-gray)] mb-6 inline-block">← 返回项目列表</Link>} />;
}
