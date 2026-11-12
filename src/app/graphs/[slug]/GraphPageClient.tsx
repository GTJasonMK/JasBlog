import Link from "next/link";
import { GraphView } from "@jas/content-ui/views";
import type { Graph } from "@/types/graph";
export default function GraphPageClient({ graph }: { graph: Graph }) {
  return <GraphView graph={graph} back={<Link href="/graphs" className="text-sm text-[var(--color-gray)] mb-6 inline-block">← 返回图谱列表</Link>} />;
}
