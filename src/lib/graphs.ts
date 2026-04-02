import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { parseGraphDocument } from "./graph-document";
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
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(graphsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      try {
        const { data, content } = matter(fileContents);
        const parsed = parseGraphDocument(slug, content);

        return {
          slug,
          name: data.name || data.title || slug,
          description: data.description || "",
          date: formatDate(data.date),
          nodeCount: parsed.graphData.nodes.length,
          edgeCount: parsed.graphData.edges.length,
          error: parsed.error || undefined,
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
  const fullPath = path.join(graphsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  try {
    const { data, content } = matter(fileContents);
    const parsed = parseGraphDocument(slug, content);

    return {
      slug,
      name: data.name || data.title || slug,
      description: data.description || "",
      date: formatDate(data.date),
      content: parsed.remainingContent,
      graphData: parsed.graphData,
      error: parsed.error || undefined,
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
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}
