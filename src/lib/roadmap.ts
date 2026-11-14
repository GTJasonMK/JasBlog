import path from "path";
import type { RoadmapStatus } from "@jas/content-core/roadmap-status";
import {
  calculateRoadmapProgress,
  parseRoadmapItemsFromContent,
  type RoadmapContentItem,
  type RoadmapProgress,
} from "@jas/content-core/roadmap-content";
import {
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import { resolveRoadmapDisplay, type ParsedContentDocument, type RoadmapMetadata } from "@jas/content-core";

const roadmapsDirectory = path.join(process.cwd(), "content/roadmaps");

export type RoadmapItem = RoadmapContentItem;

export type { RoadmapStatus } from "@jas/content-core/roadmap-status";

export interface Roadmap extends Pick<RoadmapMetadata, "publication" | "publishedAt"> {
  slug: string;
  title: string;
  description: string;
  date: string;
  status: RoadmapStatus;
  items: RoadmapItem[];
  content: string;
  error?: string;
}

export interface RoadmapMeta extends Pick<RoadmapMetadata, "publication" | "publishedAt"> {
  slug: string;
  title: string;
  description: string;
  date: string;
  status: RoadmapStatus;
  progress: RoadmapProgress;
  error?: string;
}

function normalizeRoadmap(slug: string, { metadata: rawMetadata, content, issues }: ParsedContentDocument): Roadmap {
  const { items, remainingContent } = parseRoadmapItemsFromContent(content);
  const metadata = rawMetadata as RoadmapMetadata;
  const display = resolveRoadmapDisplay(slug, metadata);
  const error = issues.join("\n") || undefined;

  return {
    slug,
    title: display.title,
    description: metadata.description,
    date: display.date,
    publication: metadata.publication,
    publishedAt: metadata.publishedAt,
    status: display.status,
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
        title: roadmap.title,
        description: roadmap.description,
        date: roadmap.date,
        publication: roadmap.publication,
        publishedAt: roadmap.publishedAt,
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
  return readParsedContentFiles(roadmapsDirectory, "roadmap").map((roadmap) => roadmap.slug);
}
