import assert from "node:assert/strict";
import test from "node:test";
import { filterNotesByCategory } from "@jas/content-core";
import { PAGE_SIZE, pageCount, pageHref, paginate } from "../src/lib/pagination";

test("每页最多十二篇，顺序翻完时没有遗漏或重复", () => {
  const notes = Array.from({ length: 192 }, (_, id) => ({ id }));
  const pages = Array.from({ length: pageCount(notes.length) }, (_, index) => paginate(notes, index + 1));
  assert.equal(PAGE_SIZE, 12);
  assert.equal(pages.length, 16);
  assert(pages.every((page) => page.items.length === 12));
  assert.deepEqual(pages.flatMap((page) => page.items), notes);
  assert.equal(pageCount(12), 1);
  assert.equal(pageCount(13), 2);
  assert.equal(pageCount(24), 2);
});

test("先按分类筛选再分页，最后一页保留剩余文章", () => {
  const notes = Array.from({ length: 50 }, (_, id) => ({ id, category: id < 33 ? "database" : "python" }));
  const filtered = filterNotesByCategory(notes, [{ id: "database", name: "数据库" }, { id: "python", name: "Python" }], "database");
  const last = paginate(filtered, 3);
  assert.equal(last.pageCount, 3);
  assert.deepEqual(last.items.map((item) => item.id), [24, 25, 26, 27, 28, 29, 30, 31, 32]);
  assert.deepEqual(paginate(filtered, 4).items, []);
  assert.deepEqual(paginate([], 1).items, []);
  assert.equal(pageCount(0), 1);
});

test("页码只保留首尾和相邻页，边界可达且没有多余空页", () => {
  assert.deepEqual(paginate([1], 1).pages, [1]);
  const notes = Array.from({ length: 192 }, (_, id) => id);
  assert.deepEqual(paginate(notes, 1).pages, [1, 2, 3, 16]);
  assert.deepEqual(paginate(notes, 8).pages, [1, 7, 8, 9, 16]);
  assert.deepEqual(paginate(notes, 16).pages, [1, 14, 15, 16]);
  for (const page of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => paginate(notes, page), RangeError);
  }
});

test("分页地址保留分类与标签，第一页使用笔记入口地址", () => {
  const search = new URLSearchParams({ category: "database", tag: "PostgreSQL" }).toString();
  assert.equal(pageHref("/notes", 1), "/notes");
  assert.equal(pageHref("/notes", 2), "/notes/page/2");
  assert.equal(pageHref("/notes", 3, search), "/notes/page/3?category=database&tag=PostgreSQL");
  assert.equal(pageHref("/notes", 1, search), "/notes?category=database&tag=PostgreSQL");
  assert.equal(pageHref("/timeline", 2), "/timeline/page/2");
});
