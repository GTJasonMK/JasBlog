import path from "path";
import {
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import { resolveNoteDisplay, type ParsedContentDocument, type NoteMetadata, type NoteListEntry } from "@jas/content-core";

const notesDirectory = path.join(process.cwd(), "content/notes");

export type PostMeta = NoteListEntry;

export interface Post extends PostMeta {
  content: string;
}

function normalizePost(slug: string, parsed: ParsedContentDocument): PostMeta {
  const metadata = parsed.metadata as NoteMetadata;
  return {
    slug,
    ...metadata,
    ...resolveNoteDisplay(slug, metadata),
    tags: metadata.tags ?? [],
    error: parsed.issues.join("\n") || undefined,
  };
}

export function getAllPosts(): PostMeta[] {
  const allPosts = readParsedContentFiles(notesDirectory, "note")
    .map(({ slug, parsed }) => normalizePost(slug, parsed));

  return sortByDateDescThenSlug(allPosts);
}

export function getPostBySlug(slug: string): Post | null {
  const parsedFile = readParsedContentBySlug(notesDirectory, slug, "note");

  if (!parsedFile) {
    return null;
  }

  return {
    ...normalizePost(slug, parsedFile.parsed),
    content: parsedFile.parsed.content,
  };
}

export function getAllPostSlugs(): string[] {
  return readParsedContentFiles(notesDirectory, "note").map((post) => post.slug);
}
