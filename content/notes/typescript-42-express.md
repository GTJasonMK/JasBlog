---
title: "TypeScript 42：Express 中间件：请求沿什么顺序被处理"
date: "2026-11-12"
excerpt: "路由里request.body为空，中间件明明写了，为什么没生效？沿注册顺序追踪解析、认证、业务和错误路径，明确每一层何时响应、何时next。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

JSON解析中间件放在路由后面，路由读取body时它还没执行。Express不会根据依赖自动重排代码，请求按注册链向下走；每一层都可能结束响应，也可能把控制权交出去。

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

next继续匹配后面的处理，next(error)进入错误链。已经response.json以后通常return结束当前逻辑；如果继续next或再次写响应，就可能出现headers already sent。忘记响应也不next，则请求会一直等待到外层超时。

这组笔记示例以 Express 5 为准。Express 5 会把返回的 Promise rejection 传入错误中间件；Express 4 的 async handler 需要显式 catch 并调用 next(error)，或使用统一包装函数。不要让未处理的 async 错误悬挂请求。

这组实现只采用Express 5的路径，不再叠加旧版异步包装。路由内部另外启动而未返回的Promise，仍不属于框架等待的返回链；定时器或后台任务错误也要由其生命周期管理，不能假定都会进入请求错误中间件。

错误中间件使用四个参数err、request、response、next，放在路由与未找到处理之后。先识别输入解析等预期错误，再记录系统异常并返回稳定结构；如果响应已开始，按框架要求交给后续错误处理，不再试图补一份完整JSON。

设置 JSON 请求体大小上限，并在生产开启安全响应头与认证端点限速，避免无界输入和密码暴力尝试。

express.json只负责按内容类型解析有限正文，不验证title、status与资源权限。认证中间件确认身份，再由路由解析业务输入，最后调用服务。日志只记录必要方法、路由模板、状态与耗时，不默认保存整个body和Cookie。

示例只创建app，未监听端口；完整入口可以导入它并启动Server，测试则直接把app交给Supertest。把应用装配与进程监听分开，能够验证注册顺序而不占用真实端口。

## 每条处理路径都要结束响应或传递控制权

- 中间件顺序会影响行为。
- 忘记 return 或结束响应可能导致重复发送。
- 不要在路由中重复解析和信任未经校验的请求体。

## 动手验证

添加一个请求日志中间件和 /api/health 路由；验证日志不包含 Cookie 或密码。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Node.js 服务：配置、入口与进程生命周期](/notes/typescript-41-node-runtime) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：把任务操作设计成 REST API](/notes/typescript-43-rest-api)

