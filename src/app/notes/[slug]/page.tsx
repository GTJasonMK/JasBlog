import { NoteView } from "@jas/content-ui/views";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import Comments from "@/components/Comments";
import { getSite } from "@/lib/site";

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

  const post = getPostBySlug(decodeURIComponent(slug));
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

  const post = getPostBySlug(decodeURIComponent(slug));
  if (!post) {
    notFound();
  }
  const site = getSite();
  return <NoteView note={post} back={<Link href="/notes" className="text-sm text-[var(--color-gray)] mb-8 inline-block">← 返回{site.sections.notes.title}</Link>} comments={<Comments config={site.comments} />} />;
}
