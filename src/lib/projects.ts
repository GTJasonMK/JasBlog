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

const projectsDirectory = path.join(process.cwd(), "content/projects");

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

export interface Project {
  slug: string;
  name: string;
  description: string;
  github: string; // 必填的 GitHub 地址
  demo?: string; // 可选的演示地址
  date: string;
  tags: string[];
  techStack: TechItem[];
  content: string;
  error?: string;
}

export interface TechItem {
  name: string;
  icon?: string; // 可选的图标名称
  color?: string; // 可选的自定义颜色
}

export interface ProjectMeta {
  slug: string;
  name: string;
  description: string;
  github: string;
  demo?: string;
  date: string;
  tags: string[];
  techStack: TechItem[];
  error?: string;
}

// 解析技术栈配置
function parseTechStack(techStack: unknown): TechItem[] {
  if (!techStack) return [];
  if (typeof techStack === "string") {
    return parseStringArray(techStack).map((name) => ({ name }));
  }
  if (!Array.isArray(techStack)) return [];

  return techStack.map((item) => {
    if (typeof item === "string") {
      return { name: item };
    }
    if (!item || typeof item !== "object") {
      return { name: "" };
    }

    const normalizedItem = item as { name?: unknown; icon?: unknown; color?: unknown };
    return {
      name: String(normalizedItem.name || "").trim(),
      icon: typeof normalizedItem.icon === "string" ? normalizedItem.icon : undefined,
      color: typeof normalizedItem.color === "string" ? normalizedItem.color : undefined,
    };
  }).filter((item) => Boolean(item.name));
}

// 获取所有项目的元数据（按日期排序）
export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjects = fileNames
    .filter(isMarkdownFileName)
    .map((fileName) => {
      const slug = stripMarkdownExtension(fileName);
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const parsed = parseFrontmatter(fileContents, "project");
      const { data, error } = parsed;

      return {
        slug,
        name: readFrontmatterString(data.name, data.title, slug) ?? slug,
        description: readFrontmatterString(data.description) ?? "",
        github: readFrontmatterString(data.github) ?? "",
        demo: readFrontmatterString(data.demo),
        date: formatDate(data.date),
        tags: parseStringArray(data.tags),
        techStack: parseTechStack(data.techStack),
        error,
      };
    });

  return allProjects.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 获取单个项目的完整内容
export function getProjectBySlug(slug: string): Project | null {
  const fullPath = resolveMarkdownFilePath(projectsDirectory, slug);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const parsed = parseFrontmatter(fileContents, "project");
  const { data, content, error } = parsed;

  return {
    slug,
    name: readFrontmatterString(data.name, data.title, slug) ?? slug,
    description: readFrontmatterString(data.description) ?? "",
    github: readFrontmatterString(data.github) ?? "",
    demo: readFrontmatterString(data.demo),
    date: formatDate(data.date),
    tags: parseStringArray(data.tags),
    techStack: parseTechStack(data.techStack),
    content,
    error,
  };
}

// 获取所有项目的 slug（用于静态生成）
export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  return fileNames
    .filter(isMarkdownFileName)
    .map(stripMarkdownExtension);
}

// 获取所有项目标签
export function getAllProjectTags(): string[] {
  const projects = getAllProjects();
  const tagSet = new Set<string>();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
