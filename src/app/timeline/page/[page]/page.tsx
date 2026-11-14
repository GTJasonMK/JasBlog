import { notFound } from "next/navigation";
import TimelinePage from "@/components/TimelinePage";
import { pageCount } from "@/lib/pagination";
import { getAllPublications } from "@/lib/publications";
import { sectionMetadata } from "@/lib/site";

type Props = { params: Promise<{ page: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  const count = pageCount(getAllPublications().length);
  return count > 1 ? Array.from({ length: count - 1 }, (_, index) => ({ page: String(index + 2) })) : [{ page: "__empty_static_params__" }];
}
export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  const metadata = sectionMetadata("timeline");
  return { ...metadata, title: page === "__empty_static_params__" ? "时间线未找到" : `${metadata.title}（第 ${page} 页）` };
}
export default async function Page({ params }: Props) {
  const page = Number((await params).page);
  if (!Number.isSafeInteger(page) || page < 2) notFound();
  return <TimelinePage page={page} />;
}
