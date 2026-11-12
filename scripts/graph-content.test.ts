import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyGraph } from "@jas/graph-core";
import { parseGraphDocument } from "@jas/content-core/graph-document";
import { MarkdownRenderer } from '@jas/content-ui/markdown';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test("合法 graph 文档保留完整图谱与其他正文", () => {
  const graph = { ...createEmptyGraph(), nodes: [{ id: "n1", type: "knowledgeNode", position: { x: 0, y: 0 }, data: { label: "节点", content: "", tags: [], createdAt: 1, updatedAt: 1 } }] };
  const parsed = parseGraphDocument("前言\n\n```graph\n" + JSON.stringify(graph) + "\n```\n");
  assert.equal(parsed.error, null);
  assert.deepEqual(parsed.graphData, graph);
  assert.equal(parsed.remainingContent, '前言');
});

test("错误图谱在实际正文渲染中显示错误并保留代码块", () => {
  const content = '```graph\n{"nodes":"invalid","edges":[]}\n```';
  const markup = renderToStaticMarkup(createElement(MarkdownRenderer, { content }));
  assert.match(markup, /role="alert"/);
  assert.match(markup, /language-graph/);
  assert.match(markup, /nodes/);
  assert.match(markup, /invalid/);
});

test("残缺节点不会进入渲染流程，错误包含具体字段", () => {
  const content = '```graph\n' + JSON.stringify({ ...createEmptyGraph(), nodes: [{ id: "n1", data: { label: "残缺节点" } }] }) + '\n```';
  const markup = renderToStaticMarkup(createElement(MarkdownRenderer, { content }));
  assert.match(markup, /role="alert"/);
  assert.match(markup, /position/);
  assert.match(markup, /残缺节点/);
});
