---
title: "TypeScript 43：把任务操作设计成 REST API"
date: "2026-11-12"
excerpt: "我会先列出任务的集合操作和单条资源操作，再为它们选择方法与状态码。身份由会话确认，分页有明确上限，才能让接口合同和数据访问规则对得上。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会先列出任务的集合操作和单条资源操作，再为它们选择方法与状态码。身份由会话确认，分页有明确上限，才能让接口合同和数据访问规则对得上。

URL 表示资源，HTTP 方法表示操作。用集合路径获取或创建资源，用资源 id 访问、修改或删除单条记录。PATCH 通常用于局部更新，响应状态与内容要保持一致。

列表 API 可用 limit、cursor 等分页参数；服务端需设置上限并校验输入。创建成功返回 201 和新资源；删除成功可返回 204。

错误响应应有稳定结构，例如 code 与 message；内部堆栈只进入服务端日志。

## 资源归属和查询范围由服务端限定

- 不把所有操作都设计成 POST。
- 不相信客户端传来的 ownerId；身份来自服务端会话。
- 分页参数不能允许无限制数据库扫描。

## 动手验证

为任务设计列表、创建、详情、局部修改和删除接口，并列出每个接口的成功与常见失败状态码。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Express 中间件：请求沿什么顺序被处理](/notes/typescript-42-express) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：输入校验与错误响应：在边界拒绝无效数据](/notes/typescript-44-validation-errors)

