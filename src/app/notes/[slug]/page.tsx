import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { preprocessAlerts } from "@/lib/preprocess-alerts";
import { decodeRouteSlug } from "@/lib/route-slug";
import ArticleContent from "@/components/ArticleContent";
import Comments from "@/components/Comments";

interface Props {
  params: Promise<{ slug: string }>;
}

const EMPTY_STATIC_PARAM = "__empty_static_params__";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  const staticSlugs = slugs.length > 0 ? slugs : [EMPTY_STATIC_PARAM];
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    return { title: "笔记未找到" };
  }

  const post = getPostBySlug(decodeRouteSlug(slug));
  if (!post) {
    return { title: "笔记未找到" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;

  if (slug === EMPTY_STATIC_PARAM) {
    notFound();
  }

  const post = getPostBySlug(decodeRouteSlug(slug));
  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/notes"
        className="text-sm text-[var(--color-gray)] hover:text-[var(--color-vermilion)] mb-8 inline-block"
      >
        &larr; 返回笔记列表
      </Link>

      {/* 纸页卡片 */}
      <header className="relative bg-[var(--color-paper)] border border-[var(--color-paper-darker)] rounded-2xl p-8 mb-8 overflow-hidden">
        {/* 右上角朱红圆印装饰 */}
        <div className="absolute -top-3 -right-3 w-24 h-24 rounded-full border-2 border-dashed border-[var(--color-vermilion)]/15" />
        <div className="border-l-4 border-[var(--color-vermilion)] pl-6">
          <p className="text-xs tracking-[0.16em] uppercase text-[var(--color-gold)] mb-2">学习笔记</p>
          <time className="text-sm text-[var(--color-gray)]">{post.date}</time>
          <h1 className="text-3xl font-bold mt-2 mb-4">{post.title}</h1>
          {post.error && (
            <div className="mb-4 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-gray)]">
              <p className="mb-1 font-medium text-[var(--color-danger)]">frontmatter 错误</p>
              <p>{post.error}</p>
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/notes?tag=${encodeURIComponent(tag)}`}
                  className="tag hover:bg-[var(--color-vermilion)] hover:text-white"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="divider-cloud mb-8" />

      <ArticleContent content={preprocessAlerts(post.content)} />

      <div className="divider-cloud my-12" />

      <section>
        <h2 className="text-xl font-semibold mb-6">评论与讨论</h2>
        <Comments />
      </section>
    </div>
  );
}
