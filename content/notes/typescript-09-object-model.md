---
title: "TypeScript 09：对象、原型与 class 的关系"
date: "2026-11-12"
excerpt: "读 JavaScript 的类时，我会先看属性是在实例自身，还是来自原型。class 让写法更集中，但对象查找属性的机制仍然值得单独弄清楚。"
tags: [ "TypeScript", "JavaScript 语法" ]
category: "typescript-02-javascript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

读 JavaScript 的类时，我会先看属性是在实例自身，还是来自原型。class 让写法更集中，但对象查找属性的机制仍然值得单独弄清楚。

JavaScript 对象可从原型继承属性和方法。class 语法提供较熟悉的构造、实例方法和继承写法，但底层仍基于原型。组合对象往往比深层继承更容易维护。

~~~js
class Task {
  constructor(title) {
    this.title = title;
    this.done = false;
  }

  complete() {
    this.done = true;
  }
}
~~~

初学者可先用对象和纯函数表达业务，只有需要封装状态与行为时再使用类。异常用 throw 抛出、try/catch 捕获；捕获后应采取明确动作或重新抛出。

## 继承和异常处理都要有明确目的

- class 的方法默认不在实例自身属性中，而在原型上。
- 继承不应只为了复用一小段代码。
- 空 catch 会隐藏错误，不能静默忽略失败。

## 动手验证

给 Task 增加完成和重开方法；再说明用普通对象加函数是否更合适。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：函数与闭包：函数记住了什么](/notes/typescript-08-functions-scope) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：模块、Node.js 与 npm：让文件和依赖各归其位](/notes/typescript-10-modules-node-npm)

