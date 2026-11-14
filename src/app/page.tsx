import { visibleNavigation } from "@jas/content-core";
import HomePortal from "@/components/HomePortal";
import { getAllPages } from "@/lib/pages";
import { getSite } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const site = getSite();
  return <HomePortal name={site.name} home={site.home} sections={site.sections} navigation={visibleNavigation(site, getAllPages().map((page) => page.slug))} noteCount={getAllPosts().length} />;
}
