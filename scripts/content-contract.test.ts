import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  parseFrontmatter,
  readFrontmatterString,
} from "../src/lib/frontmatter.ts";
import { normalizeRoadmapStatus } from "../src/lib/roadmap-status.ts";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("站点会显式暴露 frontmatter YAML 错误，而不是让构建阶段直接炸掉", () => {
  const raw = `---
title: [broken
---

正文
`;

  const parsed = parseFrontmatter(raw, "note");

  assert.equal(parsed.content.trim(), "正文");
  assert.deepEqual(parsed.data, {});
  assert.match(parsed.error || "", /frontmatter|YAML/i);
});

test("roadmap 非法 status 会归一为 active，并附带显式错误", () => {
  const parsed = normalizeRoadmapStatus("archived");

  assert.equal(parsed.status, "active");
  assert.match(parsed.error || "", /status/i);
});

test("frontmatter 文本字段只接受字符串，非字符串会回退到后备值", () => {
  assert.equal(readFrontmatterString({ bad: true }, "fallback"), "fallback");
  assert.equal(readFrontmatterString(123, "fallback"), "fallback");
  assert.equal(readFrontmatterString("", "fallback"), "fallback");
  assert.equal(readFrontmatterString("标题", "fallback"), "标题");
});

test("project 详情页只在存在 GitHub 地址时渲染 GitHub 按钮", () => {
  const source = readRepoFile("src/app/projects/[slug]/page.tsx");

  assert.match(source, /\{project\.github && \(/);
});

test("diary 多条聚合标题使用中文文案，与编辑器一致", () => {
  const source = readRepoFile("src/lib/diary.ts");

  assert.match(source, /\$\{date\} 考研日志/);
});

test("动态详情页会先解码路由 slug，再读取内容", () => {
  const pagePaths = [
    "src/app/notes/[slug]/page.tsx",
    "src/app/projects/[slug]/page.tsx",
    "src/app/graphs/[slug]/page.tsx",
    "src/app/roadmap/[slug]/page.tsx",
  ];

  for (const pagePath of pagePaths) {
    const source = readRepoFile(pagePath);

    assert.match(source, /decodeRouteSlug/);
  }
});
