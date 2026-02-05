// 节点颜色类型
export type NodeColor = "default" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

// 节点颜色配置（与 GraphAndTable 一致）
export const nodeColorConfig: Record<NodeColor, { bg: string; border: string; text: string }> = {
  default: { bg: "#FDFBF8", border: "#DDD5CB", text: "#3D3329" },
  red: { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B" },
  orange: { bg: "#FFF7ED", border: "#FDBA74", text: "#9A3412" },
  yellow: { bg: "#FEFCE8", border: "#FDE047", text: "#854D0E" },
  green: { bg: "#F0FDF4", border: "#86EFAC", text: "#166534" },
  blue: { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF" },
  purple: { bg: "#FAF5FF", border: "#C4B5FD", text: "#6B21A8" },
  pink: { bg: "#FDF2F8", border: "#F9A8D4", text: "#9D174D" },
};

// 连线重要程度等级（与 GraphAndTable 一致）
export const EDGE_IMPORTANCE_RANKS = [
  "p0", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
] as const;

export type EdgeImportance = (typeof EDGE_IMPORTANCE_RANKS)[number];

// 连线颜色类型
export type EdgeColor = "default" | EdgeImportance;

// 连线颜色配置（与 GraphAndTable 一致）
export const edgeColorConfig: Record<EdgeColor, { stroke: string; label: string; description: string }> = {
  default: { stroke: "#64748B", label: "默认", description: "未设置重要度" },
  p0: { stroke: "#DC2626", label: "P0 核心", description: "核心知识点" },
  p1: { stroke: "#F97316", label: "P1 极重要", description: "非常关键的知识点" },
  p2: { stroke: "#F59E0B", label: "P2 很重要", description: "较关键的知识点" },
  p3: { stroke: "#EAB308", label: "P3 重要", description: "重要知识点" },
  p4: { stroke: "#84CC16", label: "P4 较重要", description: "较重要知识点" },
  p5: { stroke: "#22C55E", label: "P5 一般", description: "一般知识点" },
  p6: { stroke: "#10B981", label: "P6 次要", description: "次要知识点" },
  p7: { stroke: "#06B6D4", label: "P7 延伸", description: "延伸/补充知识点" },
  p8: { stroke: "#3B82F6", label: "P8 参考", description: "参考信息/旁支内容" },
  p9: { stroke: "#8B5CF6", label: "P9 可忽略", description: "低优先级内容" },
};

// 获取边颜色的 stroke 值
export function getEdgeStroke(color?: EdgeColor): string {
  if (!color || !edgeColorConfig[color]) {
    return edgeColorConfig.default.stroke;
  }
  return edgeColorConfig[color].stroke;
}

// 边关系类型
export type EdgeRelation = "related" | "prerequisite" | "extends" | "custom";

// 锁定模式（与 GraphAndTable 一致）
export type LockMode = "direct" | "transitive";

// 知识节点数据类型
export interface KnowledgeNodeData {
  label: string;
  content?: string; // TipTap HTML 内容
  tags?: string[];
  color?: NodeColor;
  edgeColor?: EdgeColor;
  locked?: boolean;
  lockMode?: LockMode;
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

// 图谱元数据（列表用）
export interface GraphMeta {
  slug: string;
  name: string;
  description: string;
  date: string;
  nodeCount: number;
  edgeCount: number;
}

// 完整的图谱（包含内容）
export interface Graph {
  slug: string;
  name: string;
  description: string;
  date: string;
  content: string; // 正文内容（不含 graph 代码块）
  graphData: GraphData; // 图谱数据
}
