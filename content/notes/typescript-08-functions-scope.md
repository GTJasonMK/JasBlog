---
title: "TypeScript 08：函数与闭包：函数记住了什么"
date: "2026-11-12"
excerpt: "makeCounter已经返回，count为什么还没消失？通过两个独立计数器追踪闭包保留的绑定，再区分词法作用域与普通函数的this。"
tags: [ "TypeScript", "JavaScript 语法" ]
category: "typescript-02-javascript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

函数执行结束，局部变量是不是都不能再用了？如果它返回的函数还保留对某些绑定的访问，这部分环境就仍然有用途。闭包可以把状态留给特定调用者，不需要先造一个全局变量。

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

输出1和2。两次next访问的是同一次makeCounter调用创建的count，所以第二次接着累加。再执行 `const another = makeCounter()`，会创建另一份count，another第一次仍然得到1；共享还是独立，取决于外层函数实际调用了几次。

词法作用域按函数定义位置向外查找名称，不按是谁调用它临时决定。把next传给别的模块，仍然访问原来的count。函数没有保存count最初的数值快照，而是保留对该绑定的访问，因此之后的修改也能被看到。

闭包适合计数、参数预设与受控状态封装，但被长期持有的回调也可能把很大的外层对象留在内存。解绑事件或清理任务时，同时考虑回调生命周期，不只删除页面上的一个元素。

普通函数的 this 由调用方式决定；箭头函数从外层捕获 this。遇到回调和类方法时，先理解调用者是谁，再决定是否使用箭头函数。

`object.method()` 中this通常是object，把method取出后单独调用就不再保留这个调用关系。箭头函数没有自己的动态this，适合明确沿用外层上下文；需要构造函数或动态接收者时则不能随意替换。词法变量查找与this绑定要分别追踪。

函数作为参数传递时，传的是以后可调用的值；写 `handler()` 则立即执行，把返回值传出去。事件绑定和定时器里，这一对括号往往决定工作发生在注册时还是触发时。

## 回调的作用域和 this 要分别看

- 不要把所有函数都改成箭头函数；需要动态 this 时普通函数更合适。
- 闭包捕获的是变量绑定，循环中创建回调时要理解作用域规则。
- 函数应尽量保持输入和输出清晰，减少隐藏的共享状态。

## 动手验证

用闭包实现一个只允许调用三次的函数；超过后返回 limit。

分别创建两个实例，确认各自前三次独立计数。再把同一个实例传给两个调用方，观察次数会共享；这能直接检查状态究竟属于哪个函数环境。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：数组与对象：选择、转换和浅拷贝](/notes/typescript-07-arrays-objects) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：对象、原型与 class 的关系](/notes/typescript-09-object-model)

