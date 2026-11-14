---
title: "TypeScript 11：Promise 与事件循环：等待不等于阻塞线程"
date: "2026-11-12"
excerpt: "写进async函数的耗时循环，为什么仍让页面卡住？从同步执行与微任务继续的顺序解释Promise和await，再区分并行发起、失败传播与取消。"
tags: [ "TypeScript", "JavaScript 异步与工具" ]
category: "typescript-03-js-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

把一个十秒循环放进async函数，页面仍然十秒不响应。async改变的是返回值与等待方式，不会把同步计算搬到另一个线程。理解异步，先看代码在哪一刻真的把执行机会交了出去。

Promise 表示未来可能成功或失败的结果。async 函数总返回 Promise；await 等待 Promise 完成，并把拒绝转换为异常。事件循环让 JavaScript 在等待 I/O 时继续处理其他工作。

~~~js
async function loadTasks() {
  const response = await fetch("/api/tasks");
  if (!response.ok) {
    throw new Error("加载失败，HTTP " + response.status);
  }
  return response.json();
}
~~~

loadTasks调用后立即返回Promise，fetch等待期间当前异步函数暂停，其他可调度工作有机会继续。响应到来后继续执行状态检查，再异步读取JSON。失败会让返回的Promise拒绝，调用方用await配合try/catch处理；这里没有添加只记录一遍又原样抛出的包装。

Promise的回调在当前同步代码结束后通过微任务继续。下面先打印1，再打印3，最后打印2：

~~~js
console.log(1);
Promise.resolve().then(() => console.log(2));
console.log(3);
~~~

new Promise里的执行器会同步运行，因此把大循环塞进去也不会离开主线程。持续制造微任务还可能让其他任务长时间得不到机会；CPU密集工作需要分片调度或适用环境中的Worker，而不是多加一层Promise。

多个互相独立的请求可以考虑 Promise.all；其中一个失败时，返回的 Promise 会拒绝，但其余已经启动的请求不会自动取消。需要共同取消时，可以显式传递 AbortSignal。需要分别处理结果时可用 Promise.allSettled。

先await用户再请求任务，会把两段等待串起来；若任务请求不依赖用户结果，可以先都发起再一起等待。Promise.all的结果次序对应输入次序，不按谁先完成排列。请求量很大时仍需限制并发，不能一次制造无限等待与连接压力。

## 异步结果需要等待，也需要处理失败

- 忘记 await 会让后续代码拿到 Promise，而不是 Promise 的结果。
- 未处理的 Promise rejection 会造成难以定位的问题。
- 不能 await 普通同步值来“等待”外部事件。

await普通值会把后续代码安排到异步继续，但没有建立点击、网络或数据库完成条件。真正要等什么，必须由那个事件对应的Promise表达。忘记返回内部Promise也会让上层提前认为函数完成，所以沿调用链检查结果有没有被正确等待。

## 动手验证

写两个异步函数并行加载用户和任务列表；任意一个失败时，调用方能捕获错误。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：模块、Node.js 与 npm：让文件和依赖各归其位](/notes/typescript-10-modules-node-npm) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：fetch 的失败：网络、HTTP 和业务要分开处理](/notes/typescript-12-fetch-errors)

