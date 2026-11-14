---
title: "TypeScript 24：工具类型、模板字面量与 satisfies"
date: "2026-11-12"
excerpt: "更新任务时允许改哪些字段，应该由业务明确指定。我会先选出可修改字段，再考虑把它们变成可选，而不是直接对整个数据库模型套一层 Partial。"
tags: [ "TypeScript", "进阶类型" ]
category: "typescript-06-typescript-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

更新任务时允许改哪些字段，应该由业务明确指定。我会先选出可修改字段，再考虑把它们变成可选，而不是直接对整个数据库模型套一层 Partial。

Partial、Required、Readonly、Pick、Omit、Record、Exclude、Extract、ReturnType 和 Parameters 可从旧类型构造新类型。模板字面量类型可把字符串字面量类型组合成受限字符串集合。

~~~ts
type Task = { id: string; title: string; done: boolean };
type TaskUpdate = Partial<Pick<Task, "title" | "done">>;
type EventName = "task" | "user";
type EventAction = "created" | "deleted";
type EventKey = `${EventName}:${EventAction}`;

type TaskStatus = "todo" | "in_progress" | "done";
const defaults = {
  status: "todo",
  pageSize: 20,
} as const satisfies { status: TaskStatus; pageSize: number };
~~~

模板字面量类型把成员组合成 task:created、user:deleted 等字符串。satisfies 检查对象是否符合目标形状，同时保留更具体的推导类型；as const 保留字面量值。

satisfies 从 TypeScript 4.9 开始提供；若项目使用更早版本，需要升级编译器或改用显式类型标注。

实际项目中，更新请求应明确允许修改哪些字段，不能简单把完整数据库模型全部设为可选。

## 工具类型不能替代数据校验

- 工具类型只改变静态视图，不验证或转换运行时对象。
- Partial<Task> 可能允许业务上不合理的空更新。
- 不要让公共接口泄漏数据库内部字段。
- satisfies 只做编译期检查，不会在运行时验证对象。

## 动手验证

为任务修改请求创建只包含 title、description、status、dueAt 的类型；排除 id 和 ownerId。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：映射类型与条件类型：类型也可以按规则变换](/notes/typescript-23-mapped-conditional-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：TypeScript 类：接口、抽象类与私有字段](/notes/typescript-25-typescript-classes)

