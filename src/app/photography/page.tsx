import { notFound } from "next/navigation";
import { PhotographyView } from "@jas/content-ui";
import { getPhotos } from "@/lib/photography";
import { getSite, sectionEnabled, sectionMetadata } from "@/lib/site";

export function generateMetadata() { return sectionMetadata("photography"); }
export default function PhotographyPage() {
  if (!sectionEnabled("photography")) notFound();
  const section = getSite().sections.photography;
  return <PhotographyView photos={getPhotos()} title={section.title} description={section.description} />;
}
