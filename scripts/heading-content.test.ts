import test from "node:test";
import assert from "node:assert/strict";
import {
  createHeadingIdResolver,
  extractHeadingsFromContent,
  generateHeadingId,
} from "../src/lib/heading-content.ts";

test("重复标题会生成稳定且唯一的锚点 id", () => {
  const resolveHeadingId = createHeadingIdResolver();

  assert.equal(resolveHeadingId("重复标题"), "重复标题");
  assert.equal(resolveHeadingId("重复标题"), "重复标题-1");
  assert.equal(resolveHeadingId("重复标题"), "重复标题-2");
});

test("纯符号标题会回退到稳定占位 id", () => {
  assert.equal(generateHeadingId(" !!! "), "section");
});

test("目录提取会忽略 fenced code block，并与标题锚点规则保持一致", () => {
  const items = extractHeadingsFromContent(`
## 重复标题

\`\`\`ts
## 伪标题
\`\`\`

## 重复标题
### !!!
`);

  assert.deepEqual(items, [
    { id: "重复标题", text: "重复标题", level: 2 },
    { id: "重复标题-1", text: "重复标题", level: 2 },
    { id: "section", text: "!!!", level: 3 },
  ]);
});
