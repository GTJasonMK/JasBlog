import fs from "node:fs";
import path from "node:path";
import { CONTENT_SECTIONS, parseMarkdownContent, readPublication, stripMarkdownExtension, type JasBlogContentType, type ParsedContentDocument } from "@jas/content-core";
import { markdownFiles } from "@jas/site-tools/files";
import { compareDateDescThenSlug } from "@jas/content-core/date-sort";
import { getSite } from "./site";

function directoryPublished(type: JasBlogContentType): boolean {
  const section = CONTENT_SECTIONS[type];
  return section === null || getSite().sections[section].enabled;
}

export interface ParsedContentFile { slug: string; fullPath: string; parsed: ParsedContentDocument }

function contentFiles(directory: string, recursive = false): string[] {
  const root = process.env.JASBLOG_WORKSPACE_ROOT ?? process.cwd();
  return markdownFiles(root, path.relative(root, directory), recursive).map((relative) => path.join(root, relative));
}

function readContent(fullPath: string, type: JasBlogContentType): ParsedContentFile {
  return { slug: stripMarkdownExtension(path.basename(fullPath)), fullPath, parsed: parseMarkdownContent(fs.readFileSync(fullPath, "utf8"), type) };
}

export function readParsedContentFiles(directory: string, type: JasBlogContentType, recursive = false, options: { ignoreSection?: boolean } = {}): ParsedContentFile[] {
  if (!options.ignoreSection && !directoryPublished(type)) return [];
  const preview = process.env.JASBLOG_PREVIEW === "1";
  return contentFiles(directory, recursive).map((file) => readContent(file, type)).filter(({ parsed }) => preview || readPublication(parsed.metadata.publication) === "published");
}

export function readParsedContentBySlug(directory: string, slug: string, type: JasBlogContentType): ParsedContentFile | null {
  if (!directoryPublished(type)) return null;
  const file = contentFiles(directory).find((file) => stripMarkdownExtension(path.basename(file)) === slug);
  if (!file) return null;
  const result = readContent(file, type);
  return process.env.JASBLOG_PREVIEW === "1" || readPublication(result.parsed.metadata.publication) === "published" ? result : null;
}

export function sortByDateDescThenSlug<T extends { date: string; slug: string }>(items: T[]): T[] {
  return items.sort(compareDateDescThenSlug);
}
