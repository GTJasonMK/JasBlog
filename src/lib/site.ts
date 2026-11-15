import fs from "node:fs";
import path from "node:path";
import { parseSiteConfig } from "@jas/content-core";
import { readSite } from "@jas/site-tools";
import type { SectionId } from "@jas/content-core";

export function getSite() {
  const root = process.env.JASBLOG_WORKSPACE_ROOT ?? process.cwd();
  if (process.env.JASBLOG_PREVIEW === "1") return parseSiteConfig(JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8")), { draft: true });
  return readSite(root);
}
export function sectionEnabled(section: SectionId) { return getSite().sections[section].enabled; }
export function sectionMetadata(section: SectionId) { const { title, description } = getSite().sections[section]; return { title, description }; }
export function collectionMetadata(slug: string) { const collection = (getSite().collections ?? []).find((item) => item.slug === slug); return collection ? { title: collection.title, description: collection.description } : { title: "栏目未找到" }; }
