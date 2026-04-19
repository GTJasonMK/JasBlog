import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("站点顶部导航与内容模块文案保持中文一致", () => {
  const headerSource = readRepoFile("src/components/Header.tsx");

  assert.match(headerSource, /label: "开源项目"/);
  assert.match(headerSource, /label: "学习笔记"/);
  assert.match(headerSource, /label: "考研日志"/);
  assert.match(headerSource, /label: "知识图谱"/);
  assert.match(headerSource, /label: "我的规划"/);
});

test("diary 页面与详情页文案改为中文，和编辑器预览一致", () => {
  const pageSource = readRepoFile("src/app/diary/page.tsx");
  const timelineSource = readRepoFile("src/components/DiaryTimeline.tsx");
  const detailSource = readRepoFile("src/components/diary/DiaryDayView.tsx");

  assert.match(pageSource, /title: "考研日志"/);
  assert.match(pageSource, />考研日志</);
  assert.match(pageSource, /暂无考研日志条目/);
  assert.match(timelineSource, /年份/);
  assert.match(timelineSource, /全部年份/);
  assert.match(timelineSource, /月份/);
  assert.match(timelineSource, /全部月份/);
  assert.match(timelineSource, /条记录/);
  assert.match(timelineSource, /当前筛选条件下没有考研日志条目/);
  assert.match(detailSource, /返回考研日志时间线/);
  assert.match(detailSource, /考研日志/);
});

test("notes、graphs、roadmap 详情页返回文案与空状态使用中文", () => {
  const notesListSource = readRepoFile("src/components/NotesList.tsx");
  const noteDetailSource = readRepoFile("src/app/notes/[slug]/page.tsx");
  const graphDetailSource = readRepoFile("src/app/graphs/[slug]/GraphPageClient.tsx");
  const roadmapDetailSource = readRepoFile("src/app/roadmap/[slug]/page.tsx");

  assert.match(notesListSource, /未找到标签/);
  assert.match(notesListSource, /暂无笔记/);
  assert.match(noteDetailSource, /返回笔记列表/);
  assert.match(graphDetailSource, /返回图谱列表/);
  assert.match(graphDetailSource, /操作提示/);
  assert.match(graphDetailSource, /个节点/);
  assert.match(graphDetailSource, /条连接/);
  assert.match(roadmapDetailSource, /返回规划列表/);
  assert.match(roadmapDetailSource, /暂无任务项/);
});
