import fs from "fs";
import path from "path";
import matter from "gray-matter";

import {
  type Graph,
  type GraphData,
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

// 验证图数据格式
function isValidGraphData(data: unknown): data is GraphData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.edges) &&
    obj.nodes.every(
      (node: unknown) =>
        typeof node === "object" &&
        node !== null &&
        "id" in node &&
        "position" in node &&
        "data" in node
    )
  );
}

/**
 * 从 Markdown 内容中提取 graph 代码块
 * 返回 { graphData, remainingContent }
 * 如果没有找到 graph 代码块，抛出错误
 */
function extractGraphFromContent(content: string, slug: string): {
  graphData: GraphData;
  remainingContent: string;
} {
  // 匹配 ```graph ... ``` 代码块
  const graphBlockRegex = /```graph\s*\n([\s\S]*?)\n```/;
  const match = content.match(graphBlockRegex);

  if (!match) {
    throw new Error(`图谱 "${slug}" 缺少 \`\`\`graph 代码块，知识图谱必须包含图谱数据`);
  }

  const jsonStr = match[1].trim();
  let graphData: GraphData;

  try {
    graphData = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`图谱 "${slug}" 的 graph 代码块 JSON 格式错误: ${e}`);
  }

  if (!isValidGraphData(graphData)) {
    throw new Error(`图谱 "${slug}" 的 graph 数据格式无效，需要包含 nodes 和 edges 数组`);
  }

  // 移除 graph 代码块，保留其他内容
  const remainingContent = content.replace(graphBlockRegex, "").trim();

  return { graphData, remainingContent };
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
        const { graphData } = extractGraphFromContent(content, slug);

        return {
          slug,
          name: data.name || data.title || slug,
          description: data.description || "",
          date: formatDate(data.date),
          nodeCount: graphData.nodes.length,
          edgeCount: graphData.edges.length,
        };
      } catch (e) {
        console.error(`解析图谱 ${slug} 失败:`, e);
        return null;
      }
    })
    .filter((graph): graph is GraphMeta => graph !== null);

  return graphs.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 根据 slug 获取单个图谱
export function getGraphBySlug(slug: string): Graph | null {
  const fullPath = path.join(graphsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const { graphData, remainingContent } = extractGraphFromContent(content, slug);

    return {
      slug,
      name: data.name || data.title || slug,
      description: data.description || "",
      date: formatDate(data.date),
      content: remainingContent,
      graphData,
    };
  } catch (e) {
    console.error(`获取图谱 ${slug} 失败:`, e);
    return null;
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
