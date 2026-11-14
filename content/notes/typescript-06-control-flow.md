---
title: "TypeScript 06：判断、循环与默认值：0 和空字符串怎么办"
date: "2026-11-12"
excerpt: "给配置设置默认值时，我会先确认 0 或空字符串是否是合法输入。这个答案决定了该用空值合并还是逻辑或，不能只看两种写法哪一种更短。"
tags: [ "TypeScript", "JavaScript 语法" ]
category: "typescript-02-javascript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

给配置设置默认值时，我会先确认 0 或空字符串是否是合法输入。这个答案决定了该用空值合并还是逻辑或，不能只看两种写法哪一种更短。

使用 if/else 表达分支，使用 for...of 遍历可迭代集合。&&、|| 会返回操作数本身，可用于短路求值。?? 只在值为 null 或 undefined 时使用默认值。

~~~js
const pageSize = requestedSize ?? 20;

if (pageSize < 1 || pageSize > 100) {
  throw new Error("pageSize 必须在 1 到 100 之间");
}
~~~

常见假值包括空字符串、0、NaN、null、undefined 和 false。?? 与 || 的差异在于：如果合法值是 0 或空字符串，|| 也会触发默认值。

## 默认值不能覆盖本来合法的输入

- 在边界条件下优先写显式判断，不要依赖不熟悉的真值转换。
- 比较时明确输入类型；请求参数通常先以字符串形式到达服务端。
- 循环中修改正在遍历的集合容易引起跳项或重复处理。

## 动手验证

实现一个函数：输入页码和每页数量，页码最小为 1，每页数量限制在 1 到 100；无效输入抛出错误。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：JavaScript 变量：const 限制的到底是什么](/notes/typescript-05-values-and-variables) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：数组与对象：选择、转换和浅拷贝](/notes/typescript-07-arrays-objects)

