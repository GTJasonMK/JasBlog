"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ArticleCard from "./ArticleCard";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

interface NotesListProps {
  posts: Post[];
  allTags: string[];
}

export default function NotesList({ posts, allTags }: NotesListProps) {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") || "";
  const [selectedTag, setSelectedTag] = useState(initialTag);

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  return (
    <>
      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag("")}
              className={`tag ${
                !selectedTag
                  ? "bg-[var(--color-vermilion)] text-white"
                  : "hover:bg-[var(--color-vermilion)] hover:text-white"
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
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

      {/* 文章列表 */}
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
          {selectedTag ? `没有标签为「${selectedTag}」的文章` : "暂无文章，敬请期待..."}
        </p>
      )}
    </>
  );
}
