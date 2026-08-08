"use client";

import Giscus from "@giscus/react";

type RepoFullName = `${string}/${string}`;

function parseRepoFullName(value: string | undefined): RepoFullName | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.includes("/")) return null;
  return trimmed as RepoFullName;
}

export default function Comments() {
  const repo = parseRepoFullName(process.env.NEXT_PUBLIC_GISCUS_REPO);
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!repo || !repoId || !category || !categoryId) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="text-sm text-[var(--color-gray)]">
          评论未配置：请设置 <span className="font-mono">NEXT_PUBLIC_GISCUS_*</span> 环境变量
        </div>
      );
    }
    return null;
  }

  return (
    <Giscus
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
    />
  );
}
