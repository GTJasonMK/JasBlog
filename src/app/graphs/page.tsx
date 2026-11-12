import { GraphsListView } from "@jas/content-ui/lists";
import { notFound } from "next/navigation";
import { getAllGraphs } from "@/lib/graphs";

import { sectionEnabled, sectionMetadata } from "@/lib/site";
export function generateMetadata() { return sectionMetadata("graphs"); }

export default function GraphsPage() {
  if (!sectionEnabled("graphs")) notFound();
  const graphs = getAllGraphs();
  return <GraphsListView items={graphs} />;
}
