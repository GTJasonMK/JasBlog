---
title: "TypeScript 19：类型收窄：检查怎样影响后面的代码"
date: "2026-11-12"
excerpt: "读一个联合类型的处理函数时，我会跟着分支走：这次检查排除了什么，早返回后还剩哪些可能。很多类型报错其实是在提醒某种输入还没有被处理。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

读一个联合类型的处理函数时，我会跟着分支走：这次检查排除了什么，早返回后还剩哪些可能。很多类型报错其实是在提醒某种输入还没有被处理。

类型收窄指编译器根据控制流缩小联合类型。常用检查包括 typeof、instanceof、in 和判空。对外部输入，应先检查形状再读取字段。

~~~ts
function formatId(id: string | number): string {
  if (typeof id === "number") {
    return id.toFixed(0);
  }
  return id.toUpperCase();
}
~~~

控制流分析会追踪分支、早返回和赋值。早返回常让代码更容易读，也能缩小后续代码中的类型。

## 断言和真实检查的作用不同

- typeof value === "object" 还可能得到 null 或数组，需要进一步判断。
- 类型断言不会验证值；它只是要求编译器相信开发者。
- in 只能证明属性存在，不能保证属性值业务上有效。

## 动手验证

实现一个函数，接收 string、number 或 null；分别格式化字符串和数字，并为 null 返回空文本。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：type、interface 与联合类型怎么配合](/notes/typescript-18-alias-interface-unions) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：类型守卫与穷尽检查：把状态处理完整](/notes/typescript-20-type-guards)

