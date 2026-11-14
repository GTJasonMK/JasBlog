---
title: "TypeScript 11：Promise 与事件循环：等待不等于阻塞线程"
date: "2026-11-12"
excerpt: "我理解 await 时，会先记住它暂停的是当前异步函数，不是让整个 JavaScript 线程停下来。但同步计算仍然会占用线程，Promise 本身不会把计算自动移到后台。"
tags: [ "TypeScript", "JavaScript 异步与工具" ]
category: "typescript-03-js-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我理解 await 时，会先记住它暂停的是当前异步函数，不是让整个 JavaScript 线程停下来。但同步计算仍然会占用线程，Promise 本身不会把计算自动移到后台。

Promise 表示未来可能成功或失败的结果。async 函数总返回 Promise；await 等待 Promise 完成，并把拒绝转换为异常。事件循环让 JavaScript 在等待 I/O 时继续处理其他工作。

~~~js
async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
      throw new Error("加载失败，HTTP " + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error("请求失败", error);
    throw error;
  }
}
~~~

多个互相独立的请求可以考虑 Promise.all；其中一个失败时，返回的 Promise 会拒绝，但其余已经启动的请求不会自动取消。需要共同取消时，可以显式传递 AbortSignal。需要分别处理结果时可用 Promise.allSettled。

## 异步结果需要等待，也需要处理失败

- 忘记 await 会让后续代码拿到 Promise，而不是 Promise 的结果。
- 未处理的 Promise rejection 会造成难以定位的问题。
- 不能 await 普通同步值来“等待”外部事件。

## 动手验证

写两个异步函数并行加载用户和任务列表；任意一个失败时，调用方能捕获错误。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：模块、Node.js 与 npm：让文件和依赖各归其位](/notes/typescript-10-modules-node-npm) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：fetch 的失败：网络、HTTP 和业务要分开处理](/notes/typescript-12-fetch-errors)

