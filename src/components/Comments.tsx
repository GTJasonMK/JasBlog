"use client";
import Giscus from "@giscus/react";
import type { SiteConfig } from "@jas/content-core";

export default function Comments({ config }: { config: SiteConfig["comments"] }) {
  if (!config.enabled) return null;
  return <Giscus repo={config.repo as `${string}/${string}`} repoId={config.repoId} category={config.category} categoryId={config.categoryId} mapping="pathname" strict="1" reactionsEnabled="1" emitMetadata="0" inputPosition="top" theme="preferred_color_scheme" lang="zh-CN" />;
}
