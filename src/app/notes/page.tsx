import { Metadata } from "next";
import { Suspense } from "react";
import { getAllPosts, getAllTags } from "@/lib/posts";
import SectionTitle from "@/components/SectionTitle";
import NotesList from "@/components/NotesList";

export const metadata: Metadata = {
  title: "学习笔记",
  description: "技术文章和学习经验分享",
};

export default function NotesPage() {
  const posts = getAllPosts();
  const allTags = getAllTags();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SectionTitle subtitle="记录学习的点滴">学习笔记</SectionTitle>
      <Suspense fallback={<div>加载中...</div>}>
        <NotesList posts={posts} allTags={allTags} />
      </Suspense>
    </div>
  );
}
