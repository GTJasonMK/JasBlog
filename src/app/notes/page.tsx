import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import NotesList from "@/components/NotesList";

import { sectionEnabled, sectionMetadata } from "@/lib/site";
export function generateMetadata() { return sectionMetadata("notes"); }

export default function NotesPage() {
  if (!sectionEnabled("notes")) notFound();
  const posts = getAllPosts();

  return (
      <Suspense fallback={<div>加载中...</div>}>
        <NotesList posts={posts} />
      </Suspense>
  );
}
