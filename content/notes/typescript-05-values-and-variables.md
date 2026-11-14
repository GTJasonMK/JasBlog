---
title: "TypeScript 05：JavaScript 变量：const 限制的到底是什么"
date: "2026-11-12"
excerpt: "const 声明的对象还能改属性，这一点很容易和“常量不能变”混在一起。我会把变量绑定与对象内容分开看，再理解 null、undefined 和几种基本类型。"
tags: [ "TypeScript", "JavaScript 语法" ]
category: "typescript-02-javascript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

const 声明的对象还能改属性，这一点很容易和“常量不能变”混在一起。我会把变量绑定与对象内容分开看，再理解 null、undefined 和几种基本类型。

常见原始类型包括 string、number、boolean、bigint、symbol、undefined 和 null。数组、函数和普通对象都属于对象一类。const 禁止重新绑定变量，但不冻结对象内部属性。

~~~js
const user = { name: "Lin" };
user.name = "Mei";
console.log(user.name);

let count = 0;
count += 1;
~~~

Python 的 None 与 JavaScript 的 null 接近；undefined 常表示尚未赋值或属性不存在。使用 typeof 可检查部分值，但 typeof null 是历史兼容行为，结果为 object。

## 绑定不变不代表对象不可修改

- const 对象仍可修改；需要不可变数据时，应通过新对象更新。
- == 会进行类型转换；大多数业务代码优先用 ===。
- JavaScript 的 number 同时表示整数和浮点数，需留意精度边界。

## 动手验证

写出一个可修改计数器和一个不可重新绑定的配置对象；解释对象属性为何仍能改变。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：读懂一次 HTTP 请求和 JSON 响应](/notes/typescript-04-http-json-api) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：判断、循环与默认值：0 和空字符串怎么办](/notes/typescript-06-control-flow)

