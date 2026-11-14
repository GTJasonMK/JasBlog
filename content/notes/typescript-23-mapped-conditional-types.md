---
title: "TypeScript 23：映射类型与条件类型：类型也可以按规则变换"
date: "2026-11-12"
excerpt: "一批字段要统一改成只读，或者从返回值里取出内部类型时，我会先看内置工具是否够用。需要自己写类型变换时，再用几个具体输入确认推导结果。"
tags: [ "TypeScript", "进阶类型" ]
category: "typescript-06-typescript-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一批字段要统一改成只读，或者从返回值里取出内部类型时，我会先看内置工具是否够用。需要自己写类型变换时，再用几个具体输入确认推导结果。

映射类型遍历键并生成新属性；条件类型根据类型关系选择结果。infer 可在条件类型中提取内部类型。它们是工具类型和库声明的重要基础。

~~~ts
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ElementOf<T> = T extends readonly (infer Item)[] ? Item : T;
~~~

先使用内置工具类型；只有类型逻辑重复且能明显提升表达力时，才编写自定义类型工具。

## 复杂类型也需要小例子验证

- 类型体操难以阅读时，应回到简单对象和函数边界。
- 联合类型上的条件类型可能分发到每个成员，结果与整体判断不同。
- 复杂类型应配小例子验证推导结果。

## 动手验证

实现一个类型工具，将对象的所有字段变成只读；再用编辑器检查推导结果。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：typeof、keyof 与索引访问：从现有声明推导类型](/notes/typescript-22-type-queries) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：工具类型、模板字面量与 satisfies](/notes/typescript-24-template-utility-types)

