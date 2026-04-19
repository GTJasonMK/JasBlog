import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllDiaryDaySlugs, getDiaryDayBySlug } from "@/lib/diary";
import { decodeRouteSlug } from "@/lib/route-slug";
import DiaryDayView from "@/components/diary/DiaryDayView";

interface DiaryDetailPageProps {
  params: Promise<{ slug: string }>;
}

const EMPTY_STATIC_PARAM = "__empty_static_params__";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllDiaryDaySlugs();
  const staticSlugs = slugs.length > 0 ? slugs : [EMPTY_STATIC_PARAM];
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DiaryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    return { title: "考研日志未找到" };
  }

  const day = getDiaryDayBySlug(decodeRouteSlug(slug));
  if (!day) {
    return { title: "考研日志未找到" };
  }

  return {
    title: day.title,
    description: day.excerpt || `${day.date} 的考研日志`,
  };
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    notFound();
  }

  const day = getDiaryDayBySlug(decodeRouteSlug(slug));
  if (!day) {
    notFound();
  }

  return <DiaryDayView day={day} />;
}
