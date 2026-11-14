import { CONTENT_SECTIONS, type JasBlogContentType, type PublicationMetadata } from "@jas/content-core";
import { getAllPosts } from "./posts";
import { getAllProjects } from "./projects";
import { getAllGraphs } from "./graphs";
import { getAllRoadmaps } from "./roadmap";
import { getAllDiaryEntries } from "./diary";
import { getAllPages } from "./pages";
import { getPhotos } from "./photography";
import { getSite, sectionEnabled } from "./site";
import { contentHref } from "./content-routes";
import { orderPublications, type PublicationEntry } from "./publication-timeline";

export function getAllPublications() {
  if (!sectionEnabled("timeline")) return [];
  const site = getSite();
  const entry = (type: JasBlogContentType, id: string, title: string, description: string, metadata: PublicationMetadata, slug = id): PublicationEntry => {
    const section = CONTENT_SECTIONS[type];
    return { id: `${type}:${id}`, type, label: section ? site.sections[section].title : "页面", title, description, href: contentHref(type, slug), publishedAt: metadata.publishedAt };
  };
  return orderPublications([
    ...getAllPosts().map((item) => entry("note", item.slug, item.title, item.excerpt, item)),
    ...getAllProjects().map((item) => entry("project", item.slug, item.name, item.description, item)),
    ...getAllGraphs().map((item) => entry("graph", item.slug, item.name, item.description, item)),
    ...getAllRoadmaps().map((item) => entry("roadmap", item.slug, item.title, item.description, item)),
    ...getAllDiaryEntries().map((item) => entry("diary", item.id, item.title, item.excerpt, item, item.date)),
    ...getAllPages().map((item) => entry("page", item.slug, item.title, item.description, item)),
    ...getPhotos().map((photo): PublicationEntry => ({ id: `photo:${photo.id}`, type: "photo", label: site.sections.photography.title, title: photo.title, description: photo.alt === photo.title ? "" : photo.alt, href: `/photography#photo-${encodeURIComponent(photo.id)}`, publishedAt: photo.publishedAt })),
  ]);
}
