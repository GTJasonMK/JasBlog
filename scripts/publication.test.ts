import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createEmptyGraph } from "@jas/graph-core";
import { parseSiteConfig, SECTION_IDS } from "@jas/content-core";

test("公开规则同时约束列表、详情、静态路径、独立页面和日志聚合", async () => {
  const previous = process.cwd();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jas-publish-regression-"));
  const config = parseSiteConfig({
    name: "Synthetic site", description: "Synthetic description", footer: "Synthetic author",
    home: { heading: "Synthetic", accent: "", description: "", notesDescription: "", projectsDescription: "" },
    sections: Object.fromEntries(SECTION_IDS.map((id) => [id, { title: id, description: "", enabled: true }])),
    navigation: [], comments: { enabled: false, repo: "", repoId: "", category: "", categoryId: "" },
  });
  const write = (relative: string, text: string) => { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
  const markdown = (title: string, publication: string, extra = "", body = "Synthetic body") => `---\ntitle: ${title}\npublication: ${publication}\ndate: 2026-11-12\n${extra}---\n${body}\n`;
  try {
    write("content/site.json", JSON.stringify(config));
    write("content/notes/public.md", markdown("Public note", "published"));
    write("content/notes/draft.md", markdown("Draft secret", "draft"));
    write("content/projects/public.md", markdown("Public project", "published").replace("title:", "name:"));
    write("content/projects/draft.md", markdown("Draft project", "draft").replace("title:", "name:"));
    write("content/roadmaps/public.md", markdown("Public roadmap", "published", "status: active\n"));
    write("content/roadmaps/draft.md", markdown("Draft roadmap", "draft"));
    const graph = `\`\`\`graph\n${JSON.stringify(createEmptyGraph("code.v1"))}\n\`\`\``;
    write("content/graphs/public.md", markdown("Public graph", "published", "", graph).replace("title:", "name:"));
    write("content/graphs/draft.md", markdown("Draft graph", "draft", "", graph).replace("title:", "name:"));
    write("content/pages/about.md", markdown("About", "published", "description: Synthetic description\n"));
    write("content/pages/private.md", markdown("Private page", "draft"));
    write("content/diary/2026/11/2026-11-12-10-00.md", markdown("Public journal", "published", "time: 10:00\n"));
    write("content/diary/2026/11/2026-11-12-11-00.md", markdown("Private journal", "draft", "time: 11:00\n", "Private creative body"));
    process.chdir(root);
    const posts = await import("../src/lib/posts");
    const projects = await import("../src/lib/projects");
    const graphs = await import("../src/lib/graphs");
    const roadmaps = await import("../src/lib/roadmap");
    const diary = await import("../src/lib/diary");
    const pages = await import("../src/lib/pages");
    assert.deepEqual(posts.getAllPostSlugs(), ["public"]); assert.equal(posts.getPostBySlug("draft"), null);
    assert.deepEqual(projects.getAllProjectSlugs(), ["public"]); assert.equal(projects.getProjectBySlug("draft"), null);
    assert.deepEqual(graphs.getAllGraphSlugs(), ["public"]); assert.equal(graphs.getGraphBySlug("draft"), null);
    assert.deepEqual(roadmaps.getAllRoadmapSlugs(), ["public"]); assert.equal(roadmaps.getRoadmapBySlug("draft"), null);
    assert.equal(roadmaps.getRoadmapBySlug("public")?.title, "Public roadmap");
    assert.equal(projects.getProjectBySlug("public")?.error, undefined);
    assert.equal(graphs.getGraphBySlug("public")?.error, undefined);
    assert.deepEqual(pages.getAllPages().map((page) => page.slug), ["about"]); assert.equal(pages.getPage("private"), null);
    assert.equal(diary.getAllDiaryDays()[0].entryCount, 1);
    assert.equal(diary.getDiaryDayBySlug("2026-11-12")?.entries[0].title, "Public journal");
    assert.equal(JSON.stringify(diary.getAllDiaryDays()).includes("Private"), false);
    config.sections.notes.enabled = false; config.sections.diary.enabled = false;
    write("content/site.json", JSON.stringify(config));
    assert.deepEqual(posts.getAllPosts(), []); assert.equal(posts.getPostBySlug("public"), null);
    assert.deepEqual(diary.getAllDiaryDays(), []); assert.equal(diary.getDiaryDayBySlug("2026-11-12"), null);
  } finally { process.chdir(previous); fs.rmSync(root, { recursive: true }); }
});
