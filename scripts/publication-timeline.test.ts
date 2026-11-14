import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createEmptyGraph } from "@jas/graph-core";
import { SECTION_IDS } from "@jas/content-core";
import { groupPublications, orderPublications, type PublicationEntry } from "../src/lib/publication-timeline";
import { paginate, pageCount } from "../src/lib/pagination";

const entry = (id: string, publishedAt?: string): PublicationEntry => ({ id, type: "note", label: "学习笔记", title: id, description: "", href: `/notes/${id}`, publishedAt });

test("按首次发布时间排序，跨时区归组一致，日期精度与同刻记录均保留", () => {
  const source = [entry("unknown"), entry("day", "2026-11-14"), entry("a", "2026-11-13T20:00:00Z"), entry("b", "2026-11-14T04:00:00+08:00"), entry("old", "2026-10-01")];
  const sorted = orderPublications(source);
  assert.deepEqual(sorted.map(({ id }) => id), ["a", "b", "day", "old", "unknown"]);
  assert.equal(sorted[0].day, "2026-11-14");
  assert.deepEqual(groupPublications(sorted).map(({ month }) => month), ["2026-11", "2026-10", ""]);
  assert.equal(source[0].id, "unknown");
  const many = orderPublications(Array.from({ length: 195 }, (_, id) => entry(String(id), "2026-11-14")));
  const pages = Array.from({ length: pageCount(many.length) }, (_, index) => paginate(many, index + 1).items);
  assert(pages.every((page) => page.length <= 12));
  assert.deepEqual(pages.flat(), many);
});

test("时间线复用公开规则，覆盖七类内容并排除草稿和未公开栏目", { timeout: 60_000 }, async () => {
  const previous = process.cwd();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jas-timeline-"));
  const write = (relative: string, value: string) => { fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true }); fs.writeFileSync(path.join(root, relative), value); };
  const site = { name: "Test", description: "Test", footer: "Test", home: { motto: "Test", description: "" }, sections: Object.fromEntries(SECTION_IDS.map((id) => [id, { title: id, description: "", enabled: true }])), navigation: [], noteCategories: [], comments: { enabled: false, repo: "", repoId: "", category: "", categoryId: "" } };
  const markdown = (title: string, publication = "published", extra = "", body = "Test body") => `---\ntitle: ${title}\npublication: ${publication}\ndate: 2026-11-12\npublishedAt: 2026-11-14\n${extra}---\n${body}\n`;
  try {
    write("content/site.json", JSON.stringify(site));
    write("content/notes/note.md", markdown("Note"));
    write("content/notes/draft.md", markdown("Private marker", "draft"));
    write("content/projects/project.md", markdown("Project").replace("title:", "name:"));
    write("content/graphs/graph.md", markdown("Graph", "published", "", `\`\`\`graph\n${JSON.stringify(createEmptyGraph("code.v1"))}\n\`\`\``).replace("title:", "name:"));
    write("content/roadmaps/roadmap.md", markdown("Roadmap", "published", "status: active\n"));
    write("content/pages/page.md", markdown("Page"));
    write("content/diary/2026/11/2026-11-12-10-00.md", markdown("Diary", "published", "time: 10:00\n"));
    write("content/photography/photos.json", JSON.stringify([{ id: "photo", title: "Photo", alt: "Photo", publication: "published", publishedAt: "2026-11-14", takenAt: "2020-01-01", images: [{ src: "https://example.com/photo.webp", width: 10, height: 10 }] }]));
    process.chdir(root);
    const { getAllPublications } = await import("../src/lib/publications");
    let entries = getAllPublications();
    assert.deepEqual(entries.map(({ type }) => type).sort(), ["diary", "graph", "note", "page", "photo", "project", "roadmap"]);
    assert.equal(entries.find(({ type }) => type === "diary")?.href, "/diary/2026-11-12");
    assert.equal(entries.find(({ type }) => type === "photo")?.href, "/photography#photo-photo");
    assert.equal(JSON.stringify(entries).includes("Private marker"), false);
    site.sections.graphs.enabled = false; site.sections.photography.enabled = false;
    write("content/site.json", JSON.stringify(site));
    entries = getAllPublications();
    assert.equal(entries.length, 5);
    assert.equal(entries.some(({ type }) => type === "graph" || type === "photo"), false);
    site.sections.timeline.enabled = false;
    write("content/site.json", JSON.stringify(site));
    assert.deepEqual(getAllPublications(), []);
  } finally { process.chdir(previous); fs.rmSync(root, { recursive: true }); }
});
