---
title: "TypeScript 18：type、interface 与联合类型怎么配合"
date: "2026-11-12"
excerpt: "我会按要表达的关系来选声明方式。对象有哪些字段是一类问题，结果只可能是成功或失败又是另一类问题，联合类型很适合把这种状态区别留在类型里。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会按要表达的关系来选声明方式。对象有哪些字段是一类问题，结果只可能是成功或失败又是另一类问题，联合类型很适合把这种状态区别留在类型里。

interface 适合描述可扩展的对象形状；type 可以表示联合、交叉、原始值别名、元组和映射结果。二者都支持描述对象契约，团队应保持一致用法。

~~~ts
type TaskStatus = "todo" | "in_progress" | "done";

interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };
~~~

联合类型表示多种可能中的一种；交叉类型组合多份要求。枚举会生成运行时代码；字符串字面量联合常更轻量且适合 JSON API。

## 联合类型不能当作所有字段同时存在

- 联合类型的值不一定同时拥有各个成员的所有属性。
- 不要为了区别一个状态而强制使用数字枚举。
- 类型别名和接口不是完全可互换，组合语法不同。

## 动手验证

为任务 API 定义 todo、in_progress 和 done 三种状态，并定义成功/失败两种响应。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：函数类型：回调的输入、输出和异步性](/notes/typescript-17-function-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：类型收窄：检查怎样影响后面的代码](/notes/typescript-19-narrowing)

