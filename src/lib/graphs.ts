import path from "path";

import { parseGraphDocument } from "@jas/content-core/graph-document";
import {
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import { resolveGraphDisplay, type ParsedContentDocument, type GraphMetadata } from "@jas/content-core";
import {
  type Graph,
  type GraphMeta,
} from "@/types/graph";

const graphsDirectory = path.join(process.cwd(), "content/graphs");

function normalizeGraph(slug: string, document: ParsedContentDocument): Graph {
  const parsed = parseGraphDocument(document.content);
  const metadata = document.metadata as GraphMetadata;
  const error = [...document.issues, parsed.error].filter(Boolean).join("\n") || undefined;

  return {
    slug,
    ...metadata,
    ...resolveGraphDisplay(slug, metadata),
    content: parsed.remainingContent,
    graphData: parsed.graphData,
    error,
  };
}

export function getAllGraphs(): GraphMeta[] {
  const graphs = readParsedContentFiles(graphsDirectory, "graph")
    .map(({ slug, parsed }) => {
      const graph = normalizeGraph(slug, parsed);
      return {
        slug: graph.slug,
        name: graph.name,
        description: graph.description,
        date: graph.date,
        publication: graph.publication,
        publishedAt: graph.publishedAt,
        nodeCount: graph.graphData.nodes.length,
        edgeCount: graph.graphData.edges.length,
        error: graph.error,
      };
    });

  return sortByDateDescThenSlug(graphs);
}

export function getGraphBySlug(slug: string): Graph | null {
  const parsedFile = readParsedContentBySlug(graphsDirectory, slug, "graph");

  if (!parsedFile) {
    return null;
  }

  return normalizeGraph(slug, parsedFile.parsed);
}

export function getAllGraphSlugs(): string[] {
  return readParsedContentFiles(graphsDirectory, "graph").map((graph) => graph.slug);
}
