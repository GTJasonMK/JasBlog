---
title: "TypeScript 24：工具类型、模板字面量与 satisfies"
date: "2026-11-12"
excerpt: "Partial<Task>顺手允许修改id，静态类型为什么反而扩大了权限？先选择业务字段，再用工具类型表达局部更新，同时用satisfies检查配置而保留具体值。"
tags: [ "TypeScript", "进阶类型" ]
category: "typescript-06-typescript-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

更新任务只允许标题与完成状态，直接写Partial<Task>却也开放了id。工具类型没有理解权限，只按规则把字段变成可选。先决定允许哪些字段，再选择语法，才能避免类型越抽象、业务范围反而越大。

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

Pick选出title与done，再用Partial允许省略其中一项；Readonly约束写入视图，Required移除可选，Record表达一组键到同类值的映射。Omit适合确实只排除少数字段的视图，但对安全相关公开输入，明确选择字段通常更不易因模型新增字段而扩大范围。

Exclude与Extract对联合成员筛除或选择，ReturnType与Parameters提取函数签名关系。它们不执行函数，也不会把数据库Date变成API时间字符串。需要序列化转换时，写实际转换并定义对应输出类型。

EventKey组合两个小联合，得到四种允许文本。成员数量相乘，联合很大时会增加检查与阅读成本；若业务只允许其中部分组合，应直接表达合法组合，不能把所有排列都当成有效事件。

satisfies 从 TypeScript 4.9 开始提供；若项目使用更早版本，需要升级编译器或改用显式类型标注。

实际项目中，更新请求应明确允许修改哪些字段，不能简单把完整数据库模型全部设为可选。

satisfies检查defaults满足目标约束，配合as const保留status的todo与pageSize的20等具体信息；它不是as强制把值当成目标类型。把status拼错应编译失败，但配置从JSON读取时仍需运行时解析，静态检查不会回头验证外部文件内容。

## 工具类型不能替代数据校验

- 工具类型只改变静态视图，不验证或转换运行时对象。
- Partial<Task> 可能允许业务上不合理的空更新。
- 不要让公共接口泄漏数据库内部字段。
- satisfies 只做编译期检查，不会在运行时验证对象。

TaskUpdate仍允许空对象，这是Partial本身的含义。若接口要求至少改一个字段，解析Schema应明确拒绝空更新；若不允许null清除，也要单独限制。静态工具帮助复用关系，不能替代端点输入合同。

## 动手验证

为任务修改请求创建只包含 title、description、status、dueAt 的类型；排除 id 和 ownerId。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：映射类型与条件类型：类型也可以按规则变换](/notes/typescript-23-mapped-conditional-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：TypeScript 类：接口、抽象类与私有字段](/notes/typescript-25-typescript-classes)

