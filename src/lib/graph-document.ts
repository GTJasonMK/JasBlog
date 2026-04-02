import type { GraphData } from "../types/graph";

const GRAPH_BLOCK_REGEX = /```graph\s*\r?\n([\s\S]*?)\r?\n```/;

function createEmptyGraphData(): GraphData {
  return { nodes: [], edges: [] };
}

function isValidGraphData(value: unknown): value is GraphData {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) return false;

  return obj.nodes.every((node) => {
    if (!node || typeof node !== "object") return false;
    const candidate = node as Record<string, unknown>;
    return "id" in candidate && "position" in candidate && "data" in candidate;
  });
}

export interface ParsedGraphDocument {
  graphData: GraphData;
  remainingContent: string;
  hasGraphBlock: boolean;
  error: string | null;
}

export function parseGraphDocument(slug: string, content: string): ParsedGraphDocument {
  const match = content.match(GRAPH_BLOCK_REGEX);

  if (!match) {
    return {
      graphData: createEmptyGraphData(),
      remainingContent: content.trim(),
      hasGraphBlock: false,
      error: "缺少 ```graph 代码块：知识图谱文件必须包含 graph 数据",
    };
  }

  const jsonStr = match[1].trim();

  try {
    const parsed = JSON.parse(jsonStr) as unknown;

    if (!isValidGraphData(parsed)) {
      return {
        graphData: createEmptyGraphData(),
        remainingContent: content.trim(),
        hasGraphBlock: true,
        error: "graph 数据格式无效：需要包含 nodes/edges 数组，且节点需包含 id/position/data",
      };
    }

    return {
      graphData: parsed,
      remainingContent: content.replace(GRAPH_BLOCK_REGEX, "").trim(),
      hasGraphBlock: true,
      error: null,
    };
  } catch (error) {
    return {
      graphData: createEmptyGraphData(),
      remainingContent: content.trim(),
      hasGraphBlock: true,
      error: `graph 代码块 JSON 解析失败：${String(error)}`,
    };
  }
}
