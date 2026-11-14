---
title: "TypeScript 16：数组、元组和对象类型怎样表达约束"
date: "2026-11-12"
excerpt: "我会先判断一组数据是任意数量的同类元素，还是几个位置各有含义的值，再选择数组或元组。对象字段上的可选和只读，也都需要在使用处兑现相应约束。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会先判断一组数据是任意数量的同类元素，还是几个位置各有含义的值，再选择数组或元组。对象字段上的可选和只读，也都需要在使用处兑现相应约束。

数组元素使用同一元素类型，元组表示位置和长度都重要的小集合。对象类型可表达必需、可选、只读字段和索引签名。

~~~ts
type Task = {
  id: string;
  title: string;
  description?: string;
  readonly createdAt: Date;
};

const pair: [string, number] = ["page", 1];
const tasks: Task[] = [];
~~~

可选属性读取后可能是 undefined。readonly 限制通过该类型写入，不会在运行时冻结对象。

## 静态只读不会冻结对象

- 把字段标成可选，意味着调用方必须考虑它可能不存在。
- 索引签名会放宽对象边界，只在字段确实动态时使用。
- TypeScript 对象类型是结构化的：形状兼容即可赋值。

## 动手验证

定义一个带 id、标题、状态和可选截止日期的任务类型；写一个返回任务标题的函数。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：类型推断、unknown、any 与函数边界](/notes/typescript-15-basic-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：函数类型：回调的输入、输出和异步性](/notes/typescript-17-function-types)

