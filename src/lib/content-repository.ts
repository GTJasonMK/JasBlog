import fs from "node:fs";
import path from "node:path";
import { parseMarkdownContent, readPublication, stripMarkdownExtension, type JasBlogContentType, type ParsedContentDocument, type SectionId } from "@jas/content-core";
import { markdownFiles } from "@jas/site-tools/files";
import { compareDateDescThenSlug } from "@jas/content-core/date-sort";
import { getSite } from "./site";

function directoryPublished(type: JasBlogContentType): boolean {
  if (type === "page") return true;
  const section: SectionId = type === "note" ? "notes" : type === "project" ? "projects" : type === "graph" ? "graphs" : type;
  return getSite().sections[section].enabled;
}

export interface ParsedContentFile { slug: string; fullPath: string; parsed: ParsedContentDocument }

function contentFiles(directory: string, recursive = false): string[] {
  return markdownFiles(process.cwd(), path.relative(process.cwd(), directory), recursive).map((relative) => path.join(process.cwd(), relative));
}

function readContent(fullPath: string, type: JasBlogContentType): ParsedContentFile {
  return { slug: stripMarkdownExtension(path.basename(fullPath)), fullPath, parsed: parseMarkdownContent(fs.readFileSync(fullPath, "utf8"), type) };
}

export function readParsedContentFiles(directory: string, type: JasBlogContentType, recursive = false): ParsedContentFile[] {
  if (!directoryPublished(type)) return [];
  return contentFiles(directory, recursive).map((file) => readContent(file, type)).filter(({ parsed }) => readPublication(parsed.metadata.publication) === "published");
}

export function readParsedContentBySlug(directory: string, slug: string, type: JasBlogContentType): ParsedContentFile | null {
  if (!directoryPublished(type)) return null;
  const file = contentFiles(directory).find((file) => stripMarkdownExtension(path.basename(file)) === slug);
  if (!file) return null;
  const result = readContent(file, type);
  return readPublication(result.parsed.metadata.publication) === "published" ? result : null;
}

export function sortByDateDescThenSlug<T extends { date: string; slug: string }>(items: T[]): T[] {
  return items.sort(compareDateDescThenSlug);
}
