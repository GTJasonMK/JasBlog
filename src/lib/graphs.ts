import fs from "fs";
import path from "path";

import {
  parseFrontmatter,
  readFrontmatterString,
} from "./frontmatter";
import { parseGraphDocument } from "./graph-document";
import {
  isMarkdownFileName,
  resolveMarkdownFilePath,
  stripMarkdownExtension,
} from "./markdown-file";
import {
  type Graph,
  type GraphMeta,
} from "@/types/graph";

// 重新导出类型，供服务端组件使用
export * from "@/types/graph";

const graphsDirectory = path.join(process.cwd(), "content/graphs");

// 将日期转换为字符串格式
function formatDate(date: unknown): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}

// 获取所有图谱列表
export function getAllGraphs(): GraphMeta[] {
  if (!fs.existsSync(graphsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(graphsDirectory);
  const graphs = fileNames
    .filter(isMarkdownFileName)
    .map((fileName) => {
      const slug = stripMarkdownExtension(fileName);
      const fullPath = path.join(graphsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      try {
        const frontmatter = parseFrontmatter(fileContents, "graph");
        const { data, content, error: frontmatterError } = frontmatter;
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
    })

  return graphs.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 根据 slug 获取单个图谱
export function getGraphBySlug(slug: string): Graph | null {
  const fullPath = resolveMarkdownFilePath(graphsDirectory, slug);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  try {
    const frontmatter = parseFrontmatter(fileContents, "graph");
    const { data, content, error: frontmatterError } = frontmatter;
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
      content: fileContents.trim(),
      graphData: { nodes: [], edges: [] },
      error: `图谱文档解析失败：${String(e)}`,
    };
  }
}

// 获取所有图谱的 slug 列表
export function getAllGraphSlugs(): string[] {
  if (!fs.existsSync(graphsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(graphsDirectory);
  return fileNames
    .filter(isMarkdownFileName)
    .map(stripMarkdownExtension);
}
