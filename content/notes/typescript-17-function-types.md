---
title: "TypeScript 17：函数类型：回调的输入、输出和异步性"
date: "2026-11-12"
excerpt: "声明一个回调时，我会把它可能收到什么、返回什么、是否异步都写清楚。参数类型看起来差不多，并不说明两个回调就能承担同样的职责。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

声明一个回调时，我会把它可能收到什么、返回什么、是否异步都写清楚。参数类型看起来差不多，并不说明两个回调就能承担同样的职责。

函数类型由参数和返回值组成。回调类型要准确表达输入、输出和异步性。可选参数使用问号；剩余参数使用数组类型。重载用于同一函数根据参数形状返回不同类型，但实现签名本身也需检查。

~~~ts
type Comparator<T> = (left: T, right: T) => number;

function sortTasks<T>(items: T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare);
}
~~~

异步函数的返回值类型是 Promise 包裹的类型。优先用联合类型或泛型解决问题，避免不必要的重载。

## 可选参数也有确定的含义

- 参数名可不同，但函数参数类型和顺序必须兼容。
- 回调是否可能不调用、是否可能异步，属于重要契约。
- 可选参数允许省略或传入 undefined；传入实际值时仍需符合声明的参数类型。给回调参数加问号，也意味着调用方可以不传这个参数。

## 动手验证

给任务排序函数定义比较器类型，并实现按标题长度排序。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：数组、元组和对象类型怎样表达约束](/notes/typescript-16-object-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：type、interface 与联合类型怎么配合](/notes/typescript-18-alias-interface-unions)

