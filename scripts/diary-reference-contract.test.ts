import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  collectDiaryReferences,
  buildDiaryReferencePreviewMap,
} from "../src/lib/diary-references.ts";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("只提取 diary 中的 note / graph 内链并按 type+slug 去重", () => {
  const references = collectDiaryReferences([
    { content: "复盘了 [笔记 A](/notes/a) 和 [图谱 B](/graphs/b)。" },
    {
      content:
        "再次打开 [笔记 A](/notes/a)，外链 [官网](https://example.com) 不应进入预览。",
    },
  ]);

  assert.deepEqual(references, [
    { key: "note:a", type: "note", slug: "a", href: "/notes/a", label: "笔记 A" },
    { key: "graph:b", type: "graph", slug: "b", href: "/graphs/b", label: "图谱 B" },
  ]);
});

test("缺失引用目标时返回显式 missing 预览，而不是静默跳过", () => {
  const previews = buildDiaryReferencePreviewMap(
    [
      {
        key: "note:missing",
        type: "note",
        slug: "missing",
        href: "/notes/missing",
        label: "丢失笔记",
      },
    ],
    {
      getNoteBySlug: () => null,
      getGraphBySlug: () => null,
    }
  );

  assert.deepEqual(previews["note:missing"], {
    kind: "missing",
    referenceType: "note",
    slug: "missing",
    href: "/notes/missing",
    title: "丢失笔记",
    error: "未找到对应学习笔记：missing",
  });
});

test("diary 详情页会预加载引用预览，并交给专用 client 视图处理", () => {
  const source = readRepoFile("src/app/diary/[slug]/page.tsx");

  assert.match(source, /collectDiaryReferences/);
  assert.match(source, /buildDiaryReferencePreviewMap/);
  assert.match(source, /DiaryDayView/);
});

test("diary 引用弹窗支持 Esc 与遮罩关闭", () => {
  const source = readRepoFile("src/components/diary/DiaryReferenceModal.tsx");

  assert.match(source, /Escape/);
  assert.match(source, /document\.body\.style\.overflow/);
  assert.match(source, /onClick=\{\(\) => onClose\(\)\}/);
});
