import path from "node:path";
import { readParsedContentFiles } from "./content-repository";
import { getSite } from "./site";
import { CONTENT_DIRS, resolveCollectionItems, type CollectionDocument, type ContentCollection, type JasBlogContentType } from "@jas/content-core";
import { getTemplateManifest, } from "./template-manifest";

function documentEntries(type: JasBlogContentType): CollectionDocument[] {
  const root = process.env.JASBLOG_WORKSPACE_ROOT ?? process.cwd();
  const directory = path.join(root, "content", CONTENT_DIRS[type]);
  return readParsedContentFiles(directory, type, type === "diary", { ignoreSection: true }).map(({ slug, parsed }) => {
    const metadata = parsed.metadata as { title?: string; name?: string; description?: string; excerpt?: string; date?: string; category?: string; tags?: string[]; publishedAt?: string };
    return { type, slug, title: metadata.title?.trim() || metadata.name?.trim() || slug, excerpt: metadata.excerpt ?? metadata.description ?? "", date: metadata.date ?? "", publishedAt: metadata.publishedAt, category: metadata.category, tags: metadata.tags ?? [] } as CollectionDocument & { excerpt: string };
  });
}

export function getCollections(): ContentCollection[] { return getSite().collections ?? []; }

export function getCollectionBySlug(slug: string): ContentCollection | null { return getCollections().find((collection) => collection.slug === slug) ?? null; }

export function getCollectionDocuments(collection: ContentCollection): CollectionDocument[] {
  const manifest = getTemplateManifest();
  const template = manifest.templates.find((item) => item.id === collection.templateId);
  if (!template) throw new Error(`未找到栏目模板：${collection.templateId}`);
  const documents = template.contentTypes.flatMap((type) => documentEntries(type));
  if (!collection.rule?.includeDescendants || !collection.rule.categories?.length) return resolveCollectionItems(collection, documents);
  const categories = getSite().noteCategories;
  const expanded = new Set(collection.rule.categories);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) if (category.parentId && expanded.has(category.parentId) && !expanded.has(category.id)) { expanded.add(category.id); changed = true; }
  }
  return resolveCollectionItems({ ...collection, rule: { ...collection.rule, categories: [...expanded] } }, documents);
}
