import type { DiaryEntry } from "./diary";
import type { Graph } from "./graphs";
import type { Post } from "./posts";

const INTERNAL_REFERENCE_REGEX = /\[([^\]]+)\]\((\/(?:notes|graphs)\/[^)\s#?]+)\)/g;

export type DiaryReferenceType = "note" | "graph";

export interface DiaryReferenceTarget {
  key: string;
  type: DiaryReferenceType;
  slug: string;
  href: string;
  label: string;
}

export type DiaryReferencePreview =
  | {
      kind: "note";
      slug: string;
      href: string;
      title: string;
      date: string;
      tags: string[];
      content: string;
      error?: string;
    }
  | {
      kind: "graph";
      slug: string;
      href: string;
      title: string;
      description: string;
      content: string;
      graphData: Graph["graphData"];
      error?: string;
    }
  | {
      kind: "missing";
      referenceType: DiaryReferenceType;
      slug: string;
      href: string;
      title: string;
      error: string;
    };

export type DiaryReferencePreviewMap = Record<string, DiaryReferencePreview>;

export interface DiaryReferenceLoaders {
  getNoteBySlug: (slug: string) => Post | null;
  getGraphBySlug: (slug: string) => Graph | null;
}

export function getDiaryReferenceKey(type: DiaryReferenceType, slug: string): string {
  return `${type}:${slug}`;
}

function parseDiaryReferenceHref(
  href: string
): Pick<DiaryReferenceTarget, "type" | "slug"> | null {
  const matched = href.match(/^\/(notes|graphs)\/(.+)$/);

  if (!matched) {
    return null;
  }

  return {
    type: matched[1] === "notes" ? "note" : "graph",
    slug: decodeURIComponent(matched[2]),
  };
}

export function collectDiaryReferences(
  entries: readonly Pick<DiaryEntry, "content">[]
): DiaryReferenceTarget[] {
  const deduped = new Map<string, DiaryReferenceTarget>();

  for (const entry of entries) {
    for (const match of entry.content.matchAll(INTERNAL_REFERENCE_REGEX)) {
      const label = match[1]?.trim() || "";
      const href = match[2] || "";
      const parsed = parseDiaryReferenceHref(href);

      if (!parsed) {
        continue;
      }

      const key = getDiaryReferenceKey(parsed.type, parsed.slug);
      if (deduped.has(key)) {
        continue;
      }

      deduped.set(key, {
        key,
        href,
        label,
        ...parsed,
      });
    }
  }

  return Array.from(deduped.values());
}

function buildMissingPreview(
  reference: DiaryReferenceTarget
): DiaryReferencePreview {
  const targetLabel = reference.type === "note" ? "学习笔记" : "知识图谱";

  return {
    kind: "missing",
    referenceType: reference.type,
    slug: reference.slug,
    href: reference.href,
    title: reference.label,
    error: `未找到对应${targetLabel}：${reference.slug}`,
  };
}

function buildNotePreview(
  reference: DiaryReferenceTarget,
  note: Post
): DiaryReferencePreview {
  return {
    kind: "note",
    slug: note.slug,
    href: reference.href,
    title: note.title,
    date: note.date,
    tags: note.tags,
    content: note.content,
    error: note.error,
  };
}

function buildGraphPreview(
  reference: DiaryReferenceTarget,
  graph: Graph
): DiaryReferencePreview {
  return {
    kind: "graph",
    slug: graph.slug,
    href: reference.href,
    title: graph.name,
    description: graph.description,
    content: graph.content,
    graphData: graph.graphData,
    error: graph.error,
  };
}

export function buildDiaryReferencePreviewMap(
  references: readonly DiaryReferenceTarget[],
  loaders: DiaryReferenceLoaders
): DiaryReferencePreviewMap {
  return Object.fromEntries(
    references.map((reference) => {
      if (reference.type === "note") {
        const note = loaders.getNoteBySlug(reference.slug);
        return [
          reference.key,
          note ? buildNotePreview(reference, note) : buildMissingPreview(reference),
        ];
      }

      const graph = loaders.getGraphBySlug(reference.slug);
      return [
        reference.key,
        graph ? buildGraphPreview(reference, graph) : buildMissingPreview(reference),
      ];
    })
  );
}
