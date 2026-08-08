"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PostMeta } from "@/lib/posts";
import ArticleCard from "./ArticleCard";

interface NotesListProps {
  posts: PostMeta[];
  allTags: string[];
}

export default function NotesList({ posts, allTags }: NotesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tagFromQuery = searchParams.get("tag") || "";
  const selectedTag = allTags.includes(tagFromQuery) ? tagFromQuery : "";

  const applyTagFilter = (tag: string) => {
    const normalizedTag = tag && allTags.includes(tag) ? tag : "";

    const currentTag = searchParams.get("tag") || "";
    if (currentTag === normalizedTag) return;

    const params = new URLSearchParams(searchParams.toString());
    if (normalizedTag) {
      params.set("tag", normalizedTag);
    } else {
      params.delete("tag");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyTagFilter("")}
              className={`tag ${
                !selectedTag
                  ? "bg-[var(--color-vermilion)] text-white"
                  : "hover:bg-[var(--color-vermilion)] hover:text-white"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => applyTagFilter(tag)}
                className={`tag ${
                  selectedTag === tag
                    ? "bg-[var(--color-vermilion)] text-white"
                    : "hover:bg-[var(--color-vermilion)] hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <ArticleCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              tags={post.tags}
            />
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-gray)] text-center py-16">
          {selectedTag ? `未找到标签 "${selectedTag}" 的文章。` : "暂无笔记。"}
        </p>
      )}
    </>
  );
}
