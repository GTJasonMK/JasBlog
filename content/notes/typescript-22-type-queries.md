---
title: "TypeScript 22：typeof、keyof 与索引访问：从现有声明推导类型"
date: "2026-11-12"
excerpt: "同一份状态名单写在值里一次、类型里又写一次，很容易不同步。我会尽量从已有值或类型中提取需要的信息，让修改有一个明确的来源。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

同一份状态名单写在值里一次、类型里又写一次，很容易不同步。我会尽量从已有值或类型中提取需要的信息，让修改有一个明确的来源。

typeof 可在类型位置获取变量的静态类型；keyof 生成对象键名联合；索引访问类型读取某个字段的类型。as const 可保留字面量和只读信息。

~~~ts
const statuses = ["todo", "done"] as const;
type Status = (typeof statuses)[number];

type Task = { id: string; title: string };
type TaskId = Task["id"];
type TaskKey = keyof Task;
~~~

从单一事实源推导类型，可减少改字段时漏改声明的情况。

## 静态推导与运行时对象要区分

- 类型位置的 typeof 与运行时代码的 typeof 是不同语法环境。
- keyof 的结果不一定是 string，也可能包含 number 或 symbol。
- as const 影响静态类型，不会冻结运行时对象。

## 动手验证

从状态数组推导状态联合类型，并用它标注任务对象的 status。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：泛型：保留输入与输出之间的关系](/notes/typescript-21-generics) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：映射类型与条件类型：类型也可以按规则变换](/notes/typescript-23-mapped-conditional-types)

