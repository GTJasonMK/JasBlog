import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownContent } from "@jas/content-core";
import { readFrontmatterString } from "@jas/content-core/content-common";
import { compareDateDescThenSlug } from "@jas/content-core/date-sort";
import { normalizeDiaryTime } from "@jas/content-core/diary-contract";
import { normalizeRoadmapStatus } from "@jas/content-core/roadmap-status";

test("站点会显式暴露 frontmatter YAML 错误，而不是让构建阶段直接炸掉", () => {
  const raw = `---
title: [broken
---

正文
`;

  const parsed = parseMarkdownContent(raw, "note");

  assert.equal(parsed.content.trim(), "正文");
  assert.deepEqual(parsed.frontmatterRaw, {});
  assert.match(parsed.issues.join(" "), /frontmatter|YAML/i);
});

test("roadmap 未填状态使用 active，非法值直接报错", () => {
  assert.equal(normalizeRoadmapStatus(undefined), "active");
  assert.equal(normalizeRoadmapStatus("paused"), "paused");
  assert.throws(() => normalizeRoadmapStatus("archived"), /status/i);
});

test("frontmatter 文本字段拒绝非字符串", () => {
  assert.throws(() => readFrontmatterString({ bad: true }));
  assert.throws(() => readFrontmatterString(123));
  assert.equal(readFrontmatterString(""), undefined);
  assert.equal(readFrontmatterString(" 标题 "), "标题");
});

test("diary 时间统一规范为 HH:MM，并拒绝非法时间", () => {
  assert.equal(normalizeDiaryTime("09:00"), "09:00");
  for (const value of ["9:00", "0900", "24:00", "9:0"]) assert.throws(() => normalizeDiaryTime(value));
});

test("按日期倒序的列表排序在相同日期时使用 slug 稳定打破平局", () => {
  const items = [
    { slug: "zeta", date: "2026-04-03" },
    { slug: "alpha", date: "2026-04-03" },
    { slug: "middle", date: "2026-04-02" },
  ];

  assert.deepEqual(items.sort(compareDateDescThenSlug).map((item) => item.slug), [
    "alpha",
    "zeta",
    "middle",
  ]);
});
