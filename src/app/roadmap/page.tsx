import { RoadmapsListView } from "@jas/content-ui/lists";
import { notFound } from "next/navigation";
import { getAllRoadmaps } from "@/lib/roadmap";

import { sectionEnabled, sectionMetadata } from "@/lib/site";
export function generateMetadata() { return sectionMetadata("roadmap"); }

export default function RoadmapPage() {
  if (!sectionEnabled("roadmap")) notFound();
  const roadmaps = getAllRoadmaps();
  return <RoadmapsListView items={roadmaps} />;
}
