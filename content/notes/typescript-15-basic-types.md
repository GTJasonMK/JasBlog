---
title: "TypeScript 15：类型推断、unknown、any 与函数边界"
date: "2026-11-12"
excerpt: "局部值已经能清楚推断时，我通常不重复标注；到了公共函数或外部输入边界，就需要明确说明。尤其 unknown 和 any 的选择，会直接影响后面还能检查到什么。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

局部值已经能清楚推断时，我通常不重复标注；到了公共函数或外部输入边界，就需要明确说明。尤其 unknown 和 any 的选择，会直接影响后面还能检查到什么。

常见类型有 string、number、boolean、null、undefined、bigint、symbol。变量可由初始值推断类型；函数边界、复杂对象和公共 API 通常值得显式标注。

~~~ts
const username = "Lin";
let retryCount = 0;
let selectedTask: string | null = null;

function double(value: number): number {
  return value * 2;
}
~~~

any 会关闭检查，应谨慎使用。unknown 表示暂时不知道类型，使用前需要验证。never 表示不可能到达的值；void 常用于不返回有意义结果的函数。

## 不要用 any 抹掉尚未理解的问题

- 不要给每个局部变量都写重复类型，保留清晰的推断即可。
- unknown 不可直接当作任意类型使用。
- 不要用 any 消掉错误；先理解值从哪里来。

## 动手验证

实现一个函数接收未知值，确认它是数字后返回平方，否则返回明确错误结果。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：TypeScript 的检查发生在什么时候](/notes/typescript-14-typescript-compiler) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：数组、元组和对象类型怎样表达约束](/notes/typescript-16-object-types)

