import path from "path";
import { type ParsedFrontmatter } from "./frontmatter";
import {
  listMarkdownFiles,
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import {
  formatDate,
  parseStringArray,
  readFrontmatterString,
} from "./content-common";
import {
  stripMarkdownExtension,
} from "./markdown-file";

const notesDirectory = path.join(process.cwd(), "content/notes");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  error?: string;
}

export interface Post extends PostMeta {
  content: string;
}

function normalizePost(slug: string, { data, error }: ParsedFrontmatter): PostMeta {
  return {
    slug,
    title: readFrontmatterString(data.title, slug) ?? slug,
    date: formatDate(data.date),
    excerpt: readFrontmatterString(data.excerpt) ?? "",
    tags: parseStringArray(data.tags),
    error,
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
  return listMarkdownFiles(notesDirectory)
    .map(stripMarkdownExtension);
}

export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((post) => post.tags))].sort();
}
