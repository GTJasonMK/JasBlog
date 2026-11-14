---
title: "TypeScript 07：数组与对象：选择、转换和浅拷贝"
date: "2026-11-12"
excerpt: "处理任务列表时，我会先区分这一步是在筛选、转换、查找还是汇总，再选 filter、map、find 或 reduce。需要保留原数据时，还要检查嵌套对象有没有被共同引用。"
tags: [ "TypeScript", "JavaScript 语法" ]
category: "typescript-02-javascript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

处理任务列表时，我会先区分这一步是在筛选、转换、查找还是汇总，再选 filter、map、find 或 reduce。需要保留原数据时，还要检查嵌套对象有没有被共同引用。

对象适合表示有名字的字段，数组适合表示有序集合。解构读取属性，展开语法创建浅拷贝。map 转换每个元素，filter 选择元素，find 查找一个元素，reduce 汇总结果。Map 适合任意键值映射，Set 适合唯一值集合；Date 用于日期时间，但跨 API 通常应传 ISO 字符串。

~~~js
const tasks = [
  { id: "a", status: "todo" },
  { id: "b", status: "done" },
];

const openTasks = tasks.filter((task) => task.status !== "done");
const titles = openTasks.map((task) => task.id);
~~~

对象展开只复制一层。嵌套对象仍与原对象共享引用。日期在 JSON 中通常传 ISO 字符串，客户端收到后需要按需转换为 Date。

## 浅拷贝只复制一层

- 修改原数组可能影响其他调用者；React 状态更新时通常创建新数组或对象。
- map 有返回值；仅做副作用时用 forEach 或普通循环更清楚。
- 别把对象当作任意顺序的业务列表。

## 动手验证

写一个函数，返回所有未完成任务，并用新对象把每个任务标题加上前缀；不要改动原数组。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：判断、循环与默认值：0 和空字符串怎么办](/notes/typescript-06-control-flow) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：函数与闭包：函数记住了什么](/notes/typescript-08-functions-scope)

