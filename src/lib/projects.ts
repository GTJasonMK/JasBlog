import path from "path";
import {
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import { resolveProjectDisplay, type ParsedContentDocument, type ProjectMetadata, type ProjectListEntry, type TechStackItem } from "@jas/content-core";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export type TechItem = TechStackItem;
export type ProjectMeta = ProjectMetadata & ProjectListEntry & { date: string; tags: string[]; techStack: TechStackItem[] };

export interface Project extends ProjectMeta {
  content: string;
}

function normalizeProject(slug: string, parsed: ParsedContentDocument): ProjectMeta {
  const metadata = parsed.metadata as ProjectMetadata;
  return {
    slug,
    ...metadata,
    ...resolveProjectDisplay(slug, metadata),
    tags: metadata.tags ?? [],
    techStack: metadata.techStack ?? [],
    error: parsed.issues.join("\n") || undefined,
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
  return readParsedContentFiles(projectsDirectory, "project").map((project) => project.slug);
}
