import path from "path";
import {
  readFrontmatterString,
} from "./frontmatter";
import {
  listMarkdownFiles,
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import {
  formatDate,
  parseStringArray,
} from "./content-common";
import {
  stripMarkdownExtension,
} from "./markdown-file";

const notesDirectory = path.join(process.cwd(), "content/notes");

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
  error?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  error?: string;
}

export function getAllPosts(): PostMeta[] {
  const allPosts = readParsedContentFiles(notesDirectory, "note")
    .map(({ slug, parsed }) => {
      const { data, error } = parsed;

      return {
        slug,
        title: readFrontmatterString(data.title, slug) ?? slug,
        date: formatDate(data.date),
        excerpt: readFrontmatterString(data.excerpt) ?? "",
        tags: parseStringArray(data.tags),
        error,
      };
    });

  return sortByDateDescThenSlug(allPosts);
}

export function getPostBySlug(slug: string): Post | null {
  const parsedFile = readParsedContentBySlug(notesDirectory, slug, "note");

  if (!parsedFile) {
    return null;
  }

  const { data, content, error } = parsedFile.parsed;

  return {
    slug,
    title: readFrontmatterString(data.title, slug) ?? slug,
    date: formatDate(data.date),
    excerpt: readFrontmatterString(data.excerpt) ?? "",
    tags: parseStringArray(data.tags),
    content,
    error,
  };
}

export function getAllPostSlugs(): string[] {
  return listMarkdownFiles(notesDirectory)
    .map(stripMarkdownExtension);
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
