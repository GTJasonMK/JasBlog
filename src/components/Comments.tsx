"use client";
import Giscus from "@giscus/react";
import type { SiteConfig } from "@jas/content-core";
import { useRootTheme } from "@jas/content-ui/host";

export default function Comments({ config }: { config: SiteConfig["comments"] }) {
  const theme = useRootTheme();
  if (!config.enabled) return null;
  return <Giscus repo={config.repo as `${string}/${string}`} repoId={config.repoId} category={config.category} categoryId={config.categoryId} mapping="pathname" strict="1" reactionsEnabled="1" emitMetadata="0" inputPosition="top" theme={theme} lang="zh-CN" />;
}
