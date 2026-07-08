import path from "path";
import {
  readFrontmatterString,
} from "./frontmatter";
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
import { formatDate } from "./content-common";
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

export function getAllRoadmaps(): RoadmapMeta[] {
  const allRoadmaps = readParsedContentFiles(roadmapsDirectory, "roadmap")
    .map(({ slug, parsed }) => {
      const { data, content, error: frontmatterError } = parsed;
      const { items } = parseRoadmapItemsFromContent(content);
      const status = normalizeRoadmapStatus(data.status);
      const error = [frontmatterError, status.error].filter(Boolean).join("\n") || undefined;

      return {
        slug,
        name: readFrontmatterString(data.name, data.title, slug) ?? slug,
        description: readFrontmatterString(data.description) ?? "",
        date: formatDate(data.date),
        status: status.status,
        progress: calculateRoadmapProgress(items),
        error,
      };
    });

  return sortByDateDescThenSlug(allRoadmaps);
}

export function getRoadmapBySlug(slug: string): Roadmap | null {
  const parsedFile = readParsedContentBySlug(roadmapsDirectory, slug, "roadmap");

  if (!parsedFile) {
    return null;
  }

  const { data, content, error: frontmatterError } = parsedFile.parsed;
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

export function getAllRoadmapSlugs(): string[] {
  return listMarkdownFiles(roadmapsDirectory)
    .map(stripMarkdownExtension);
}
