import fs from "fs";
import path from "path";
import {
  parseFrontmatter,
  readFrontmatterString,
} from "./frontmatter";
import {
  isMarkdownFileName,
  resolveMarkdownFilePath,
  stripMarkdownExtension,
} from "./markdown-file";

const notesDirectory = path.join(process.cwd(), "content/notes");

// 将日期转换为字符串格式
function formatDate(date: unknown): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\uFF0C\u3001]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

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

// 获取所有文章的元数据（按日期排序）
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  const allPosts = fileNames
    .filter(isMarkdownFileName)
    .map((fileName) => {
      const slug = stripMarkdownExtension(fileName);
      const fullPath = path.join(notesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const parsed = parseFrontmatter(fileContents, "note");
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

  return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 获取单篇文章的完整内容
export function getPostBySlug(slug: string): Post | null {
  const fullPath = resolveMarkdownFilePath(notesDirectory, slug);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const parsed = parseFrontmatter(fileContents, "note");
  const { data, content, error } = parsed;

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

// 获取所有文章的 slug（用于静态生成）
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  return fileNames
    .filter(isMarkdownFileName)
    .map(stripMarkdownExtension);
}

// 获取所有标签
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
