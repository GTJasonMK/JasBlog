import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArticleContentSegments } from '../src/lib/graph-content.ts';

test('合法 graph 代码块会被解析为图谱段落', () => {
  const segments = parseArticleContentSegments(`
前言

\`\`\`graph
{
  "nodes": [{ "id": "n1", "position": { "x": 0, "y": 0 }, "data": { "label": "节点" } }],
  "edges": []
}
\`\`\`
`);

  assert.equal(segments.length, 2);
  assert.equal(segments[1]?.type, 'graph');
});

test('JSON 合法但 graph 结构不合法时，退回为普通代码块而不是图谱段落', () => {
  const segments = parseArticleContentSegments(`
\`\`\`graph
{
  "nodes": "invalid",
  "edges": []
}
\`\`\`
`);

  assert.equal(segments.length, 1);
  assert.deepEqual(segments[0], {
    type: 'markdown',
    content: '```json\n{\n  "nodes": "invalid",\n  "edges": []\n}```',
  });
});
