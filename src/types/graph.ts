import type { GraphData } from "@jas/graph-core";
import type { GraphListEntry } from "@jas/content-core";
export type GraphMeta = GraphListEntry & { date: string };
export type Graph = Omit<GraphMeta, "nodeCount" | "edgeCount"> & { content: string; graphData: GraphData };
