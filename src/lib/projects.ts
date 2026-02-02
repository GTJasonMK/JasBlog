import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "content/projects");

// 将日期转换为字符串格式
function formatDate(date: unknown): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
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
}

// 解析技术栈配置
function parseTechStack(techStack: unknown): TechItem[] {
  if (!techStack || !Array.isArray(techStack)) return [];
  return techStack.map((item) => {
    if (typeof item === "string") {
      return { name: item };
    }
    return {
      name: item.name || "",
      icon: item.icon,
      color: item.color,
    };
  });
}

// 获取所有项目的元数据（按日期排序）
export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjects = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        name: data.name || data.title || slug,
        description: data.description || "",
        github: data.github || "",
        demo: data.demo,
        date: formatDate(data.date),
        tags: data.tags || [],
        techStack: parseTechStack(data.techStack),
      };
    });

  return allProjects.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 获取单个项目的完整内容
export function getProjectBySlug(slug: string): Project | null {
  const fullPath = path.join(projectsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    name: data.name || data.title || slug,
    description: data.description || "",
    github: data.github || "",
    demo: data.demo,
    date: formatDate(data.date),
    tags: data.tags || [],
    techStack: parseTechStack(data.techStack),
    content,
  };
}

// 获取所有项目的 slug（用于静态生成）
export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
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
