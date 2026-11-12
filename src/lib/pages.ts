import path from "node:path";
import { validPageSlug, type PageMetadata } from "@jas/content-core";
import { readParsedContentBySlug, readParsedContentFiles } from "./content-repository";

const directory = path.join(process.cwd(), "content/pages");
export function getAllPages() { return readParsedContentFiles(directory, "page").map(({ slug, parsed }) => ({ slug, ...parsed.metadata as PageMetadata })); }
export function getPage(slug: string) {
  if (!validPageSlug(slug)) return null;
  const file = readParsedContentBySlug(directory, slug, "page");
  if (!file) return null;
  const { metadata, issues, content } = file.parsed;
  return { ...metadata as PageMetadata, slug, content, error: issues.join("\n") || undefined };
}
