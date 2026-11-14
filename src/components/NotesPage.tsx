import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts";
import { pageCount } from "@/lib/pagination";
import { getSite, sectionEnabled } from "@/lib/site";
import NotesList from "./NotesList";

export default function NotesPage({ page = 1 }: { page?: number }) {
  if (!sectionEnabled("notes")) notFound();
  const posts = getAllPosts();
  if (!Number.isSafeInteger(page) || page < 1 || page > pageCount(posts.length)) notFound();
  const section = getSite().sections.notes;

  return <div className="notes-directory">
    <h1 className="sr-only">{section.title}</h1>
    <NotesList posts={posts} page={page} />
  </div>;
}
