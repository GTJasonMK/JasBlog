import { ProjectsListView } from "@jas/content-ui/lists";
import { notFound } from "next/navigation";
import { getAllProjects } from "@/lib/projects";

import { sectionEnabled, sectionMetadata } from "@/lib/site";
export function generateMetadata() { return sectionMetadata("projects"); }

export default function ProjectsPage() {
  if (!sectionEnabled("projects")) notFound();
  const projects = getAllProjects();
  return <ProjectsListView items={projects} />;
}
