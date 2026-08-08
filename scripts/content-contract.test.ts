import test from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../src/lib/frontmatter.ts";
import { readFrontmatterString } from "../src/lib/content-common.ts";
import { compareDateDescThenSlug } from "../src/lib/date-sort.ts";
import { normalizeDiaryTime } from "../src/lib/diary-contract.ts";
import { normalizeRoadmapStatus } from "../src/lib/roadmap-status.ts";

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

test("diary 时间统一规范为 HH:MM，并拒绝非法时间", () => {
  assert.equal(normalizeDiaryTime("9:00"), "09:00");
  assert.equal(normalizeDiaryTime("0900"), "09:00");
  assert.equal(normalizeDiaryTime("24:00"), "");
  assert.equal(normalizeDiaryTime("9:0"), "");
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
