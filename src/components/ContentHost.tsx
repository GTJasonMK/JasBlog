"use client";
import Image from "next/image";
import Link from "next/link";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { ContentHostProvider } from "@jas/content-ui/host";
import { resolveImageDimensions } from "@jas/content-ui/images";
import { usePathname } from "next/navigation";
import { SECTION_IDS, type SiteConfig, type SectionId } from "@jas/content-core";
import { publicAssetUrl } from "@/lib/site-config";

function ContentImage({ src, alt, width, height, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string" || !src) return null;
  return <Image {...props} src={src} alt={alt ?? ""} {...resolveImageDimensions({ width, height })} unoptimized />;
}
export default function ContentHost({ children, sections, commentsEnabled }: { children: ReactNode; sections: SiteConfig["sections"]; commentsEnabled: boolean }) {
  const route = usePathname().split("/")[1] || "home";
  const section = (SECTION_IDS as readonly string[]).includes(route) ? route as SectionId : undefined;
  const routes = { note: 'notes', project: 'projects', graph: 'graphs', roadmap: 'roadmap', diary: 'diary', page: 'pages' };
  return <ContentHostProvider Image={ContentImage} sections={sections} section={section} commentsEnabled={commentsEnabled} assetUrl={publicAssetUrl} contentHref={(type, slug) => `/${routes[type]}/${encodeURIComponent(slug)}`} tagHref={(tag) => `/notes?tag=${encodeURIComponent(tag)}`} renderLink={(props, renderDefault) => {
    const { href, children, ...attributes } = props;
    return href?.startsWith("/") && !href.startsWith("//") ? <Link href={href} {...attributes}>{children}</Link> : renderDefault(props);
  }}>{children}</ContentHostProvider>;
}
