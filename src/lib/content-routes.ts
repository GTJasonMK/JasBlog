import { CONTENT_SECTIONS, type JasBlogContentType } from "@jas/content-core";

export function contentHref(type: JasBlogContentType, slug: string): string {
  return `/${CONTENT_SECTIONS[type] ?? "pages"}/${encodeURIComponent(slug)}`;
}
