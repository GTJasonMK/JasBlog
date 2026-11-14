---
title: "TypeScript 21：泛型：保留输入与输出之间的关系"
date: "2026-11-12"
excerpt: "我使用泛型的主要理由，是调用方需要保留具体类型。比如按 id 查找，返回值应该仍然是传进来的那种对象，而不是被放宽成一个不知道内部结构的值。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我使用泛型的主要理由，是调用方需要保留具体类型。比如按 id 查找，返回值应该仍然是传进来的那种对象，而不是被放宽成一个不知道内部结构的值。

泛型把类型作为参数传入，让函数或结构复用，同时保留调用方的具体类型。若输入和返回值相关，泛型比 any 更安全。

~~~ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const task = first([{ id: "t1", title: "读书" }]);
~~~

可以用 extends 约束泛型必须具备的字段；默认类型参数适合拥有合理常见类型的公共结构。不要为了展示复杂语法而给简单函数加泛型。

## 泛型约束只说明最低要求

- 泛型类型参数不自动代表任意对象都有某属性。
- T extends Base 表示 T 至少满足 Base，不代表 T 就是 Base。
- 如果类型参数只出现一次且没有建立类型关系，泛型可能没有必要。

## 动手验证

实现一个函数，接收任意对象数组和 id，返回 id 相同的对象或 undefined；约束对象必须有 string 类型的 id。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：类型守卫与穷尽检查：把状态处理完整](/notes/typescript-20-type-guards) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：typeof、keyof 与索引访问：从现有声明推导类型](/notes/typescript-22-type-queries)

