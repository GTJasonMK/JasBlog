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

const projectsDirectory = path.join(process.cwd(), "content/projects");

export interface TechItem {
  name: string;
  icon?: string;
  color?: string;
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

export interface Project extends ProjectMeta {
  content: string;
}

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

function normalizeProject(slug: string, { data, error }: ParsedFrontmatter): ProjectMeta {
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
}

export function getAllProjects(): ProjectMeta[] {
  const allProjects = readParsedContentFiles(projectsDirectory, "project")
    .map(({ slug, parsed }) => normalizeProject(slug, parsed));

  return sortByDateDescThenSlug(allProjects);
}

export function getProjectBySlug(slug: string): Project | null {
  const parsedFile = readParsedContentBySlug(projectsDirectory, slug, "project");

  if (!parsedFile) {
    return null;
  }

  return {
    ...normalizeProject(slug, parsedFile.parsed),
    content: parsedFile.parsed.content,
  };
}

export function getAllProjectSlugs(): string[] {
  return listMarkdownFiles(projectsDirectory)
    .map(stripMarkdownExtension);
}
