---
title: "TypeScript 22：typeof、keyof 与索引访问：从现有声明推导类型"
date: "2026-11-12"
excerpt: "状态数组增加一项，联合类型却忘了改，怎样让两者来自同一处？从typeof与索引访问提取类型，再用keyof约束字段读取，区分静态推导和运行时反射。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

状态数组里有todo和done，类型里又手写同样两项。新增状态只改了一处，界面能显示，另一处却拒绝它。若值与类型表达同一事实，可以从一个来源推导，减少需要同步的副本。

typeof 可在类型位置获取变量的静态类型；keyof 生成对象键名联合；索引访问类型读取某个字段的类型。as const 可保留字面量和只读信息。

~~~ts
const statuses = ["todo", "done"] as const;
type Status = (typeof statuses)[number];

type Task = { id: string; title: string };
type TaskId = Task["id"];
type TaskKey = keyof Task;
~~~

从单一事实源推导类型，可减少改字段时漏改声明的情况。

as const让数组保留只读元组与字面量，typeof statuses在类型位置取得这份静态类型，后面的[number]取出所有数字位置元素类型，得到todo或done。若不保留字面量，普通可变数组通常扩大成string[]，提取结果也就只是string。

Task["id"]读取字段类型，keyof Task取得id与title的键名联合。它们都在类型层工作，不会生成遍历对象的代码。运行时typeof返回number、object等字符串，两种语法场景不要混用。

## 键与返回值怎样继续关联

读取某个字段可以同时约束键与结果：

~~~ts
function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}
~~~

传入Task和id，返回类型就是string；读取不存在的deadline会在检查中失败。若另一个对象的count为number，同一函数保留对应number，而不是把所有返回值合成unknown。

Object.keys得到运行时的自有可枚举字符串键，不总能安全当作keyof T。结构化类型允许对象有额外字段，symbol键又不会出现在Object.keys里；给结果强加断言前，先核对对象是否真的受到相应边界限制。

## 静态推导与运行时对象要区分

- 类型位置的 typeof 与运行时代码的 typeof 是不同语法环境。
- keyof 的结果不一定是 string，也可能包含 number 或 symbol。
- as const 影响静态类型，不会冻结运行时对象。

状态名单仍需要用于运行时解析，例如检查输入是否属于允许集合。推导类型减少静态副本，实际检查负责拒绝未知文本；只保留其中一半，都没有让外部数据自动可信。

## 动手验证

从状态数组推导状态联合类型，并用它标注任务对象的 status。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：泛型：保留输入与输出之间的关系](/notes/typescript-21-generics) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：映射类型与条件类型：类型也可以按规则变换](/notes/typescript-23-mapped-conditional-types)

