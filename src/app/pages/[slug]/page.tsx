import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageView } from "@jas/content-ui";
import { getAllPages, getPage } from "@/lib/pages";
import { getSite } from "@/lib/site";
import Comments from "@/components/Comments";

export const dynamicParams = false;
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { const pages = getAllPages(); return (pages.length ? pages.map((page) => page.slug) : ["__empty_static_params__"]).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const page = getPage(decodeURIComponent((await params).slug)); return page ? { title: page.title, description: page.description } : { title: "页面未找到" }; }
export default async function Page({ params }: Props) {
  const page = getPage(decodeURIComponent((await params).slug));
  if (!page) notFound();
  return <PageView page={page} comments={<Comments config={getSite().comments} />} />;
}
