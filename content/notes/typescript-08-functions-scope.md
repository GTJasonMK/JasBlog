---
title: "TypeScript 08：函数与闭包：函数记住了什么"
date: "2026-11-12"
excerpt: "一个函数返回之后，里面定义的回调还可以访问外层变量。理解闭包时，我会顺着变量绑定追踪它由谁创建、何时改变，而不是把它理解成自动保存了一个快照。"
tags: [ "TypeScript", "JavaScript 语法" ]
category: "typescript-02-javascript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个函数返回之后，里面定义的回调还可以访问外层变量。理解闭包时，我会顺着变量绑定追踪它由谁创建、何时改变，而不是把它理解成自动保存了一个快照。

函数声明和箭头函数都能创建函数。函数可作为参数传递，例如数组的 filter 回调。词法作用域表示变量从代码定义位置向外查找。闭包是函数保留对外层变量的访问能力。

~~~js
function makeCounter() {
  let count = 0;
  return function increment() {
    count += 1;
    return count;
  };
}

const next = makeCounter();
console.log(next(), next());
~~~

普通函数的 this 由调用方式决定；箭头函数从外层捕获 this。遇到回调和类方法时，先理解调用者是谁，再决定是否使用箭头函数。

## 回调的作用域和 this 要分别看

- 不要把所有函数都改成箭头函数；需要动态 this 时普通函数更合适。
- 闭包捕获的是变量绑定，循环中创建回调时要理解作用域规则。
- 函数应尽量保持输入和输出清晰，减少隐藏的共享状态。

## 动手验证

用闭包实现一个只允许调用三次的函数；超过后返回 limit。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：数组与对象：选择、转换和浅拷贝](/notes/typescript-07-arrays-objects) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：对象、原型与 class 的关系](/notes/typescript-09-object-model)

