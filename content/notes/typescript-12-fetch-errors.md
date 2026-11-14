---
title: "TypeScript 12：fetch 的失败：网络、HTTP 和业务要分开处理"
date: "2026-11-12"
excerpt: "catch没有触发，响应却是500，fetch究竟算成功了什么？把取得响应、HTTP结果、JSON解析和业务字段分别检查，再处理取消与过期结果。"
tags: [ "TypeScript", "JavaScript 异步与工具" ]
category: "typescript-03-js-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

服务端返回500，fetch仍然给出Response，代码继续往下执行。这里成功的是取得HTTP响应，不是业务操作成功。只写try/catch会漏掉这一层状态，还可能把错误HTML页当JSON解析，最后只看到一个更晚的语法错误。

fetch在网络失败、请求被取消或某些调用参数无效时会拒绝；收到400或500通常仍会完成为Response，因此必须检查response.ok。请求JSON时设置Content-Type，并序列化请求体。

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

状态合适以后，json仍可能失败，因为响应为空、格式错误或正文读取中断。即使解析成对象，也要验证是否具有所需任务字段；TypeScript断言不会替这一层检查。成功JSON与有效业务对象不能合并成一次判断。

错误响应按接口约定读取机器code与可展示message，不直接展示堆栈或SQL。服务端没给合同格式时，保留HTTP状态并向用户提供可操作的通用失败信息，同时记录诊断依据；不能为保持页面“正常”返回空任务数组。

## 状态检查和响应体解析不能省略

- response.json() 也是异步操作。
- 204 响应没有 JSON body，不应无条件解析 JSON。
- 不要直接把服务端内部异常原文展示给用户。

204按合同没有正文，返回undefined还是明确的成功结果应由客户端接口约定。创建任务通常需要返回新对象时，就不应把意外204悄悄补成一个虚构任务。是否允许无正文是端点合同，不是任意请求都需要的兼容分支。

搜索框先查a再查ab，a可能更晚返回并覆盖新结果。可以取消旧请求并用请求身份确认结果仍属于当前输入；取消仅停止客户端相关等待，不保证服务端没有执行。对写请求超时，重试前还需要业务幂等或状态查询。

验证时分别提供网络拒绝、500、坏JSON、缺字段与正常响应，检查它们没有变成同一个假成功。取消由当前交互触发时也要区分，不让用户主动离开页面变成无意义的错误弹窗。

## 动手验证

为上面的函数增加对 204、非 2xx 和网络中断的区分处理。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Promise 与事件循环：等待不等于阻塞线程](/notes/typescript-11-promises-event-loop) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：调试时，先找实际数据第一次变错的位置](/notes/typescript-13-debugging)

