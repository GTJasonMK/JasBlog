import fs from "fs";
import path from "path";
import matter from "gray-matter";

const notesDirectory = path.join(process.cwd(), "content/notes");

// 将日期转换为字符串格式
function formatDate(date: unknown): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

// 获取所有文章的元数据（按日期排序）
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(notesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: formatDate(data.date),
        excerpt: data.excerpt || "",
        tags: data.tags || [],
      };
    });

  return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 获取单篇文章的完整内容
export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(notesDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    date: formatDate(data.date),
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    content,
  };
}

// 获取所有文章的 slug（用于静态生成）
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
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
