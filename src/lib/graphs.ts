import fs from "fs";
import path from "path";

import {
  type GraphData,
  type GraphMeta,
} from "@/types/graph";

// 重新导出类型，供服务端组件使用
export * from "@/types/graph";

const graphsDirectory = path.join(process.cwd(), "content/graphs");

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

// 获取所有图谱列表
export function getAllGraphs(): GraphMeta[] {
  if (!fs.existsSync(graphsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(graphsDirectory);
  const graphs = fileNames
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const slug = fileName.replace(/\.json$/, "");
      const fullPath = path.join(graphsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      try {
        const data = JSON.parse(fileContents);
        if (!isValidGraphData(data)) {
          return null;
        }

        // 从第一个节点获取图谱名称，或使用文件名
        const name =
          data.nodes.length > 0 ? data.nodes[0].data.label : slug;

        return {
          slug,
          name,
          description: `包含 ${data.nodes.length} 个知识节点`,
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length,
        };
      } catch {
        return null;
      }
    })
    .filter((graph): graph is GraphMeta => graph !== null);

  return graphs;
}

// 根据 slug 获取单个图谱数据
export function getGraphBySlug(slug: string): GraphData | null {
  const fullPath = path.join(graphsDirectory, `${slug}.json`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const data = JSON.parse(fileContents);

    if (!isValidGraphData(data)) {
      return null;
    }

    return data;
  } catch {
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
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.replace(/\.json$/, ""));
}
