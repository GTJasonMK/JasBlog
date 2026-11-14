---
title: "TypeScript 04：读懂一次 HTTP 请求和 JSON 响应"
date: "2026-11-12"
excerpt: "看接口时，我会把请求方法、路径、状态码和响应内容一起读。比如 404 说明已经收到了 HTTP 响应，和根本连不上服务器需要走不同的排查路径。"
tags: [ "TypeScript", "Web 基础" ]
category: "typescript-01-web"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

看接口时，我会把请求方法、路径、状态码和响应内容一起读。比如 404 说明已经收到了 HTTP 响应，和根本连不上服务器需要走不同的排查路径。

HTTP 请求由方法、路径、头部和可选请求体组成；响应包含状态码、头部和可选响应体。JSON 是常见数据格式，但 JSON 本身没有日期、函数或 TypeScript 类型。

~~~http
POST /api/tasks
Content-Type: application/json

{"title":"学习 HTTP","status":"todo"}
~~~

常见方法：GET 读取、POST 创建、PATCH 局部修改、DELETE 删除。常见状态码：200 成功、201 已创建、204 无响应体成功、400 输入错误、401 未登录、403 无权限、404 不存在、500 服务端错误。

## HTTP 错误和网络错误要分开

- 收到 HTTP 404 时，请求本身通常已成功到达服务器；这是 HTTP 响应，不一定是网络故障。
- JSON 字符串中的属性名和字符串值都使用双引号。
- 状态码要表达结果，响应体提供可操作的细节。

## 动手验证

设计一个“获取任务列表”的请求和响应 JSON，并写出未登录时合理的状态码。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：HTML、CSS 与 DOM：React 下面仍然是浏览器](/notes/typescript-03-html-css-dom) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：JavaScript 变量：const 限制的到底是什么](/notes/typescript-05-values-and-variables)

