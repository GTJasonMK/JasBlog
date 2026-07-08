import path from "path";

import {
  readFrontmatterString,
} from "./frontmatter";
import { parseGraphDocument } from "./graph-document";
import {
  listMarkdownFiles,
  readParsedContentBySlug,
  readParsedContentFiles,
  sortByDateDescThenSlug,
} from "./content-repository";
import {
  formatDate,
} from "./content-common";
import {
  stripMarkdownExtension,
} from "./markdown-file";
import {
  type Graph,
  type GraphMeta,
} from "@/types/graph";

export * from "@/types/graph";

const graphsDirectory = path.join(process.cwd(), "content/graphs");

export function getAllGraphs(): GraphMeta[] {
  const graphs = readParsedContentFiles(graphsDirectory, "graph")
    .map(({ slug, parsed: frontmatter }) => {
      const { data, content, error: frontmatterError } = frontmatter;

      try {
        const parsed = parseGraphDocument(slug, content);
        const error = [frontmatterError, parsed.error].filter(Boolean).join("\n") || undefined;

        return {
          slug,
          name: readFrontmatterString(data.name, data.title, slug) ?? slug,
          description: readFrontmatterString(data.description) ?? "",
          date: formatDate(data.date),
          nodeCount: parsed.graphData.nodes.length,
          edgeCount: parsed.graphData.edges.length,
          error,
        };
      } catch (e) {
        console.error(`解析图谱 ${slug} 失败:`, e);
        return {
          slug,
          name: slug,
          description: "",
          date: "",
          nodeCount: 0,
          edgeCount: 0,
          error: `图谱文档解析失败：${String(e)}`,
        };
      }
    });

  return sortByDateDescThenSlug(graphs);
}

export function getGraphBySlug(slug: string): Graph | null {
  const parsedFile = readParsedContentBySlug(graphsDirectory, slug, "graph");

  if (!parsedFile) {
    return null;
  }

  const { data, content, error: frontmatterError } = parsedFile.parsed;

  try {
    const parsed = parseGraphDocument(slug, content);
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
  } catch (e) {
    console.error(`获取图谱 ${slug} 失败:`, e);
    return {
      slug,
      name: slug,
      description: "",
      date: "",
      content,
      graphData: { nodes: [], edges: [] },
      error: `图谱文档解析失败：${String(e)}`,
    };
  }
}

export function getAllGraphSlugs(): string[] {
  return listMarkdownFiles(graphsDirectory)
    .map(stripMarkdownExtension);
}
