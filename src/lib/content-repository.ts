import fs from "fs";
import path from "path";
import { parseFrontmatter, type ParsedFrontmatter } from "./frontmatter";
import {
  isMarkdownFileName,
  resolveMarkdownFilePath,
  stripMarkdownExtension,
} from "./markdown-file";
import { compareDateDescThenSlug } from "./date-sort";

export interface ParsedContentFile {
  slug: string;
  fileName: string;
  fullPath: string;
  parsed: ParsedFrontmatter;
}

export function listMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter(isMarkdownFileName);
}

export function readParsedContentFiles(directory: string, label: string): ParsedContentFile[] {
  return listMarkdownFiles(directory).map((fileName) => {
    const slug = stripMarkdownExtension(fileName);
    const fullPath = path.join(directory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const parsed = parseFrontmatter(fileContents, label);

    return {
      slug,
      fileName,
      fullPath,
      parsed,
    };
  });
}

export function readParsedContentBySlug(
  directory: string,
  slug: string,
  label: string,
): ParsedContentFile | null {
  const fullPath = resolveMarkdownFilePath(directory, slug);
  if (!fullPath || !fs.existsSync(fullPath)) return null;

  const fileName = path.basename(fullPath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const parsed = parseFrontmatter(fileContents, label);

  return {
    slug,
    fileName,
    fullPath,
    parsed,
  };
}

export function sortByDateDescThenSlug<T extends { date: string; slug: string }>(items: T[]): T[] {
  return items.sort(compareDateDescThenSlug);
}
