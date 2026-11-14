"use client";
import Image from "next/image";
import Link from "next/link";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { ContentHostProvider } from "@jas/content-ui/host";
import { resolveImageDimensions } from "@jas/content-ui/images";
import { usePathname } from "next/navigation";
import { SECTION_IDS, type SiteConfig, type SectionId } from "@jas/content-core";
import { publicAssetUrl } from "@/lib/site-config";
import { contentHref } from "@/lib/content-routes";

function ContentImage({ src, alt, width, height, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string" || !src) return null;
  return <Image {...props} src={src} alt={alt ?? ""} {...resolveImageDimensions({ width, height })} unoptimized />;
}
export default function ContentHost({ children, sections, noteCategories, commentsEnabled }: { children: ReactNode; sections: SiteConfig["sections"]; noteCategories: SiteConfig["noteCategories"]; commentsEnabled: boolean }) {
  const route = usePathname().split("/")[1] || "home";
  const section = (SECTION_IDS as readonly string[]).includes(route) ? route as SectionId : undefined;
  return <ContentHostProvider Image={ContentImage} sections={sections} section={section} noteCategories={noteCategories} noteCategoryHref={(id) => `/notes?category=${encodeURIComponent(id)}`} commentsEnabled={commentsEnabled} assetUrl={publicAssetUrl} contentHref={contentHref} tagHref={(tag) => `/notes?tag=${encodeURIComponent(tag)}`} renderLink={(props, renderDefault) => {
    const { href, children, ...attributes } = props;
    if (href?.startsWith("/downloads/")) return <a href={publicAssetUrl(href)} {...attributes} download>{children}</a>;
    return href?.startsWith("/") && !href.startsWith("//") ? <Link href={href} {...attributes}>{children}</Link> : renderDefault(props);
  }}>{children}</ContentHostProvider>;
}
