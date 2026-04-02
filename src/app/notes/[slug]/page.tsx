import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { preprocessAlerts } from "@/lib/preprocess-alerts";
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
    return { title: "Post not found" };
  }

  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
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

  const post = getPostBySlug(slug);
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

      <ArticleContent content={preprocessAlerts(post.content)} />

      <div className="divider-cloud my-12" />

      <section>
        <h2 className="text-xl font-semibold mb-6">Comments and discussion</h2>
        <Comments />
      </section>
    </div>
  );
}
