---
title: "TypeScript 17：函数类型：回调的输入、输出和异步性"
date: "2026-11-12"
excerpt: "比较器返回布尔值为什么不行，回调参数加问号又改变了什么？从排序合同说明函数类型怎样约束调用关系，并区分返回void和等待Promise。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

数组排序需要知道左项应排在前面、后面还是相同位置，因此比较器返回负数、正数或0。若只返回“左边更大吗”的布尔值，关系就不完整。函数类型要表达调用方真正依赖的输入输出，不能只写“这里放一个函数”。

函数类型由参数和返回值组成。回调类型要准确表达输入、输出和异步性。可选参数使用问号；剩余参数使用数组类型。重载用于同一函数根据参数形状返回不同类型，但实现签名本身也需检查。

~~~ts
type Comparator<T> = (left: T, right: T) => number;

function sortTasks<T>(items: T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare);
}
~~~

异步函数的返回值类型是 Promise 包裹的类型。优先用联合类型或泛型解决问题，避免不必要的重载。

sortTasks接收数组与比较器，复制数组后排序，因此不改变原数组次序。T把数组元素与比较器参数关联起来；传任务数组时，比较器才能安全读取任务标题。按长度排序可以返回 `left.title.length - right.title.length`，并列时需要怎样排序则另加规则。

只读输入还可把items参数改成readonly T[]，表示函数不会修改传入数组。这里的复制仍只发生在数组层，比较器若偷偷修改元素，类型签名并没有自动消除那种副作用。

## 可选参数也有确定的含义

- 参数名可不同，但函数参数类型和顺序必须兼容。
- 回调是否可能不调用、是否可能异步，属于重要契约。
- 可选参数允许省略或传入 undefined；传入实际值时仍需符合声明的参数类型。给回调参数加问号，也意味着调用方可以不传这个参数。

把 `(value: string) => void` 改成 `(value?: string) => void`，不是让实现可以少写参数，而是允许调用时不提供值。实现因而必须能处理undefined。若调用方总会给值，不应为了方便随意加问号。

## 是否等待也是合同的一部分

`() => void` 通常表示返回值被忽略，TypeScript在某些赋值位置允许一个实际返回值的函数。把async函数交给这种回调也可能通过检查，但调用方不因此自动await，拒绝可能没人处理。确实需要等待时，签名明确返回Promise，并在执行处处理失败。

重载可以表达不同输入对应不同返回，但公开重载必须覆盖实际允许的调用，实现也要满足这些约定。如果只有一个联合参数和同一种结果，普通联合签名更容易阅读；类型复杂度要对应真实关系。

## 动手验证

给任务排序函数定义比较器类型，并实现按标题长度排序。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：数组、元组和对象类型怎样表达约束](/notes/typescript-16-object-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：type、interface 与联合类型怎么配合](/notes/typescript-18-alias-interface-unions)

