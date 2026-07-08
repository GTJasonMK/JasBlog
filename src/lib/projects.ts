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

const projectsDirectory = path.join(process.cwd(), "content/projects");

export interface Project {
  slug: string;
  name: string;
  description: string;
  github: string;
  demo?: string;
  date: string;
  tags: string[];
  techStack: TechItem[];
  content: string;
  error?: string;
}

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

export function getAllProjects(): ProjectMeta[] {
  const allProjects = readParsedContentFiles(projectsDirectory, "project")
    .map(({ slug, parsed }) => {
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

  return sortByDateDescThenSlug(allProjects);
}

export function getProjectBySlug(slug: string): Project | null {
  const parsedFile = readParsedContentBySlug(projectsDirectory, slug, "project");

  if (!parsedFile) {
    return null;
  }

  const { data, content, error } = parsedFile.parsed;

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

export function getAllProjectSlugs(): string[] {
  return listMarkdownFiles(projectsDirectory)
    .map(stripMarkdownExtension);
}

export function getAllProjectTags(): string[] {
  const projects = getAllProjects();
  const tagSet = new Set<string>();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
