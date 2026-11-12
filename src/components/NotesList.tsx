"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NotesListView } from "@jas/content-ui/lists";
import type { PostMeta } from "@/lib/posts";

export default function NotesList({ posts }: { posts: PostMeta[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  return <NotesListView items={posts} selectedTag={search.get("tag") ?? ""} onTagChange={(tag) => {
    const params = new URLSearchParams(search.toString());
    if (tag) params.set("tag", tag); else params.delete("tag");
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  }} />;
}
