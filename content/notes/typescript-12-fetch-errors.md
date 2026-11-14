---
title: "TypeScript 12：fetch 的失败：网络、HTTP 和业务要分开处理"
date: "2026-11-12"
excerpt: "fetch 收到 500 也可能正常返回 Response，所以只写 try/catch 还不够。我会先检查状态码，再决定解析什么内容，最后把业务结果交给页面。"
tags: [ "TypeScript", "JavaScript 异步与工具" ]
category: "typescript-03-js-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

fetch 收到 500 也可能正常返回 Response，所以只写 try/catch 还不够。我会先检查状态码，再决定解析什么内容，最后把业务结果交给页面。

fetch 在网络失败时才直接 reject；收到 400 或 500 响应时仍会 resolve，因此必须检查 response.ok。请求 JSON 时设置 Content-Type，并序列化请求体。

~~~js
async function createTask(input) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("创建失败，HTTP " + response.status);
  }
  return response.json();
}
~~~

更完整的客户端应读取错误响应并显示可理解信息。AbortController 可用于取消过期搜索或组件卸载后的请求。

## 状态检查和响应体解析不能省略

- response.json() 也是异步操作。
- 204 响应没有 JSON body，不应无条件解析 JSON。
- 不要直接把服务端内部异常原文展示给用户。

## 动手验证

为上面的函数增加对 204、非 2xx 和网络中断的区分处理。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Promise 与事件循环：等待不等于阻塞线程](/notes/typescript-11-promises-event-loop) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：调试时，先找实际数据第一次变错的位置](/notes/typescript-13-debugging)

