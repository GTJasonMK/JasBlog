// 节点颜色类型
export type NodeColor = "default" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

// 节点颜色配置（与 GraphAndTable 一致）
export const nodeColorConfig: Record<NodeColor, { bg: string; border: string; text: string }> = {
  default: { bg: "#FFFFFF", border: "#E2E8F0", text: "#134E4A" },
  red: { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B" },
  orange: { bg: "#FFF7ED", border: "#FDBA74", text: "#9A3412" },
  yellow: { bg: "#FEFCE8", border: "#FDE047", text: "#854D0E" },
  green: { bg: "#F0FDF4", border: "#86EFAC", text: "#166534" },
  blue: { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF" },
  purple: { bg: "#FAF5FF", border: "#C4B5FD", text: "#6B21A8" },
  pink: { bg: "#FDF2F8", border: "#F9A8D4", text: "#9D174D" },
};

// 连线颜色类型（表示节点重要程度）
export type EdgeColor = "default" | "core" | "important" | "normal" | "minor";

// 连线颜色配置（与 GraphAndTable 一致）
export const edgeColorConfig: Record<EdgeColor, string> = {
  default: "#14B8A6",
  core: "#DC2626",
  important: "#F97316",
  normal: "#14B8A6",
  minor: "#94A3B8",
};

// 边关系类型
export type EdgeRelation = "related" | "prerequisite" | "extends" | "custom";

// 知识节点数据类型
export interface KnowledgeNodeData {
  label: string;
  content?: string;
  tags?: string[];
  color?: NodeColor;
  edgeColor?: EdgeColor;
  locked?: boolean;
  createdAt?: number;
  updatedAt?: number;
  // 索引签名，兼容 React Flow 的 Record<string, unknown>
  [key: string]: unknown;
}

// 边数据类型
export interface KnowledgeEdgeData {
  relation?: EdgeRelation;
  label?: string;
  color?: EdgeColor;
  [key: string]: unknown;
}

// 图节点
export interface GraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: KnowledgeNodeData;
}

// 图边
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: KnowledgeEdgeData;
  label?: string;
}

// 完整的图数据
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// 图谱元数据
export interface GraphMeta {
  slug: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
}
