"use client";

import { useMemo } from "react";
import Giscus, { type GiscusProps } from "@giscus/react";

type RepoFullName = `${string}/${string}`;

function parseRepoFullName(value: string | undefined): RepoFullName | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.includes("/")) return null;
  return trimmed as RepoFullName;
}

export default function Comments() {
  const config = useMemo(() => {
    const repo = parseRepoFullName(process.env.NEXT_PUBLIC_GISCUS_REPO);
    const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
    const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
    const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

    if (!repo || !repoId || !category || !categoryId) {
      return null;
    }

    return {
      repo,
      repoId,
      category,
      categoryId,
    };
  }, []);

  if (!config) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="text-sm text-[var(--color-gray)]">
          评论未配置：请设置 <span className="font-mono">NEXT_PUBLIC_GISCUS_*</span> 环境变量
        </div>
      );
    }
    return null;
  }

  const props: GiscusProps = {
    repo: config.repo,
    repoId: config.repoId,
    category: config.category,
    categoryId: config.categoryId,
    mapping: "pathname",
    strict: "1",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "top",
    theme: "preferred_color_scheme",
    lang: "zh-CN",
  };

  return <Giscus {...props} />;
}
