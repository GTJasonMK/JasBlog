import path from "path";

import { type ParsedFrontmatter } from "./frontmatter";
import { parseGraphDocument } from "./graph-document";
import {
  listMarkdownFiles,
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import {
  formatDate,
  readFrontmatterString,
} from "./content-common";
import {
  stripMarkdownExtension,
} from "./markdown-file";
import {
  type Graph,
  type GraphMeta,
} from "@/types/graph";

const graphsDirectory = path.join(process.cwd(), "content/graphs");

function normalizeGraph(slug: string, { data, content, error: frontmatterError }: ParsedFrontmatter): Graph {
  const parsed = parseGraphDocument(content);
  const error = [frontmatterError, parsed.error].filter(Boolean).join("\n") || undefined;

  return {
    slug,
    name: readFrontmatterString(data.name, data.title, slug) ?? slug,
    description: readFrontmatterString(data.description) ?? "",
    date: formatDate(data.date),
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
  return listMarkdownFiles(graphsDirectory)
    .map(stripMarkdownExtension);
}
