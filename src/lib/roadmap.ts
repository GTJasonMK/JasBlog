import path from "path";
import { type ParsedFrontmatter } from "./frontmatter";
import {
  normalizeRoadmapStatus,
  type RoadmapStatus,
} from "./roadmap-status";
import {
  calculateRoadmapProgress,
  parseRoadmapItemsFromContent,
  type RoadmapContentItem,
  type RoadmapProgress,
} from "./roadmap-content";
import {
  listMarkdownFiles,
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import { formatDate, readFrontmatterString } from "./content-common";
import {
  stripMarkdownExtension,
} from "./markdown-file";

const roadmapsDirectory = path.join(process.cwd(), "content/roadmaps");

export type RoadmapItem = RoadmapContentItem;

export type { RoadmapStatus } from "./roadmap-status";

export interface Roadmap {
  slug: string;
  name: string;
  description: string;
  date: string;
  status: RoadmapStatus;
  items: RoadmapItem[];
  content: string;
  error?: string;
}

export interface RoadmapMeta {
  slug: string;
  name: string;
  description: string;
  date: string;
  status: RoadmapStatus;
  progress: RoadmapProgress;
  error?: string;
}

function normalizeRoadmap(slug: string, { data, content, error: frontmatterError }: ParsedFrontmatter): Roadmap {
  const { items, remainingContent } = parseRoadmapItemsFromContent(content);
  const status = normalizeRoadmapStatus(data.status);
  const error = [frontmatterError, status.error].filter(Boolean).join("\n") || undefined;

  return {
    slug,
    name: readFrontmatterString(data.name, data.title, slug) ?? slug,
    description: readFrontmatterString(data.description) ?? "",
    date: formatDate(data.date),
    status: status.status,
    items,
    content: remainingContent,
    error,
  };
}

export function getAllRoadmaps(): RoadmapMeta[] {
  const allRoadmaps = readParsedContentFiles(roadmapsDirectory, "roadmap")
    .map(({ slug, parsed }) => {
      const roadmap = normalizeRoadmap(slug, parsed);

      return {
        slug: roadmap.slug,
        name: roadmap.name,
        description: roadmap.description,
        date: roadmap.date,
        status: roadmap.status,
        progress: calculateRoadmapProgress(roadmap.items),
        error: roadmap.error,
      };
    });

  return sortByDateDescThenSlug(allRoadmaps);
}

export function getRoadmapBySlug(slug: string): Roadmap | null {
  const parsedFile = readParsedContentBySlug(roadmapsDirectory, slug, "roadmap");

  if (!parsedFile) {
    return null;
  }

  return normalizeRoadmap(slug, parsedFile.parsed);
}

export function getAllRoadmapSlugs(): string[] {
  return listMarkdownFiles(roadmapsDirectory)
    .map(stripMarkdownExtension);
}
