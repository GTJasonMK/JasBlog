import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import ArticleContent from "@/components/ArticleContent";

// 预处理 Alert 语法
function preprocessAlerts(content: string): string {
  return content.replace(
    /^(>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\r?\n?/gm,
    "$1ALERTBOX$2ALERTBOX\n"
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

// 禁止动态路由，只生成 generateStaticParams 返回的页面
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "文章未找到" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* 返回链接 */}
      <Link
        href="/notes"
        className="text-sm text-[var(--color-gray)] hover:text-[var(--color-vermilion)] mb-8 inline-block"
      >
        &larr; 返回笔记列表
      </Link>

      {/* 文章头部 */}
      <header className="mb-8">
        <time className="text-sm text-[var(--color-gray)]">{post.date}</time>
        <h1 className="text-3xl font-bold mt-2 mb-4">{post.title}</h1>
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
      </header>

      <div className="divider-cloud mb-8" />

      {/* 文章内容 */}
      <ArticleContent content={preprocessAlerts(post.content)} />
    </div>
  );
}
