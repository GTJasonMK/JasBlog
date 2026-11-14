---
title: "TypeScript 42：Express 中间件：请求沿什么顺序被处理"
date: "2026-11-12"
excerpt: "读 Express 应用时，我会从中间件注册顺序往下跟。JSON 解析、身份检查、路由和错误处理的位置不同，请求得到的结果也会不同。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

读 Express 应用时，我会从中间件注册顺序往下跟。JSON 解析、身份检查、路由和错误处理的位置不同，请求得到的结果也会不同。

Express 路由根据方法和路径匹配处理器。中间件按注册顺序运行，可读取请求、附加信息、发送响应或调用 next。JSON body parser 应在读取请求体的路由前注册。

~~~ts
import express from "express";

const app = express();
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
~~~

把认证、请求日志和路由分别组织；错误处理中间件放在路由之后。每条路径都应最终响应或传递错误。

这组笔记示例以 Express 5 为准。Express 5 会把返回的 Promise rejection 传入错误中间件；Express 4 的 async handler 需要显式 catch 并调用 next(error)，或使用统一包装函数。不要让未处理的 async 错误悬挂请求。

设置 JSON 请求体大小上限，并在生产开启安全响应头与认证端点限速，避免无界输入和密码暴力尝试。

## 每条处理路径都要结束响应或传递控制权

- 中间件顺序会影响行为。
- 忘记 return 或结束响应可能导致重复发送。
- 不要在路由中重复解析和信任未经校验的请求体。

## 动手验证

添加一个请求日志中间件和 /api/health 路由；验证日志不包含 Cookie 或密码。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Node.js 服务：配置、入口与进程生命周期](/notes/typescript-41-node-runtime) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：把任务操作设计成 REST API](/notes/typescript-43-rest-api)

