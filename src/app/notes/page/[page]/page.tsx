import NotesPage from "@/components/NotesPage";
import { pageCount } from "@/lib/pagination";
import { getAllPosts } from "@/lib/posts";
import { sectionMetadata } from "@/lib/site";

interface Props { params: Promise<{ page: string }> }
const EMPTY_STATIC_PARAM = "__empty_static_params__";

export const dynamicParams = false;

export function generateStaticParams() {
  const count = pageCount(getAllPosts().length);
  return count > 1
    ? Array.from({ length: count - 1 }, (_, index) => ({ page: String(index + 2) }))
    : [{ page: EMPTY_STATIC_PARAM }];
}

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  const metadata = sectionMetadata("notes");
  return { ...metadata, title: page === EMPTY_STATIC_PARAM ? "笔记未找到" : `${metadata.title}（第 ${page} 页）` };
}

export default async function NotesPageRoute({ params }: Props) {
  return <NotesPage page={Number((await params).page)} />;
}
