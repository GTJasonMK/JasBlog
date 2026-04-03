import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDiaryDaySlugs, getDiaryDayBySlug } from "@/lib/diary";
import { preprocessAlerts } from "@/lib/preprocess-alerts";
import { decodeRouteSlug } from "@/lib/route-slug";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/diary"
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
        返回考研日志时间线
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <time className="text-sm text-[var(--color-gray)]">{day.date}</time>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-paper-dark)] text-[var(--color-gray)]">
            {day.entryCount} 条记录
          </span>
          {day.mood && <span className="tag">{day.mood}</span>}
          {day.weather && <span className="tag">{day.weather}</span>}
          {day.location && <span className="tag">{day.location}</span>}
        </div>
        <h1 className="text-3xl font-bold mb-3">{day.title}</h1>
        {day.excerpt && (
          <p className="text-[var(--color-gray)]">{day.excerpt}</p>
        )}
      </header>

      {day.error && (
        <div className="mb-6 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-gray)]">
          <p className="mb-1 font-medium text-[var(--color-danger)]">frontmatter 错误</p>
          <p>{day.error}</p>
        </div>
      )}

      {day.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {day.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="grid gap-6">
        {day.entries.map((entry) => (
          <article key={entry.id} className="card-hover rounded-lg p-6">
            <header className="mb-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-paper-dark)] text-[var(--color-gray)]">
                  {entry.time}
                </span>
                <h2 className="text-xl font-semibold">{entry.title}</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {entry.mood && <span className="tag">{entry.mood}</span>}
                {entry.weather && <span className="tag">{entry.weather}</span>}
                {entry.location && <span className="tag">{entry.location}</span>}
                {entry.companions.map((person) => (
                  <span key={`${entry.id}-${person}`} className="tag">{person}</span>
                ))}
              </div>
            </header>

            {entry.error && (
              <div className="mb-4 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-gray)]">
                <p className="mb-1 font-medium text-[var(--color-danger)]">frontmatter 错误</p>
                <p>{entry.error}</p>
              </div>
            )}

            {entry.excerpt && (
              <p className="text-sm text-[var(--color-gray)] mb-4">
                {entry.excerpt}
              </p>
            )}

            <div className="prose-chinese">
              <MarkdownRenderer content={preprocessAlerts(entry.content)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


