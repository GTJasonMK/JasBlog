import test from "node:test";
import assert from "node:assert/strict";

import { parseGraphDocument } from "@jas/content-core/graph-document";
import { createEmptyGraph } from "@jas/graph-core";

test("非法 graph 文档不会被发布链路静默丢弃，而是返回显式错误", () => {
  const parsed = parseGraphDocument(`前言

\`\`\`graph
{
  "nodes": "invalid",
  "edges": []
}
\`\`\`
`);

  assert.match(parsed.error ?? "", /graph 数据格式无效[\s\S]*nodes/);
  assert.deepEqual(parsed.graphData, createEmptyGraph());
  assert.equal(parsed.remainingContent.includes("```graph"), true);
});

test("缺少 graph 代码块时返回显式错误，方便列表页和详情页统一展示", () => {
  const parsed = parseGraphDocument("只有正文，没有图谱代码块");

  assert.equal(parsed.error, "缺少 ```graph 代码块：知识图谱文件必须包含 graph 数据");
  assert.equal(parsed.remainingContent, "只有正文，没有图谱代码块");
});
