---
title: "TypeScript 02：浏览器、API 与数据库之间发生了什么"
date: "2026-11-12"
excerpt: "我会从一次“新增任务”的点击开始看 Web：输入怎样变成请求，谁检查身份，谁真正写入数据库。沿着这条路径走，比先记一堆框架名称更容易分清职责。"
tags: [ "TypeScript", "Web 基础" ]
category: "typescript-01-web"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会从一次“新增任务”的点击开始看 Web：输入怎样变成请求，谁检查身份，谁真正写入数据库。沿着这条路径走，比先记一堆框架名称更容易分清职责。

浏览器负责展示页面并响应用户操作；服务端负责认证、业务规则和数据访问；数据库负责持久保存数据。浏览器不应直接连接生产数据库，也不能被当作可信环境。

典型请求流程：

1. 用户点击按钮。
2. 前端把输入转换成 HTTP 请求。
3. API 检查身份、权限和输入。
4. API 调用数据库并构造响应。
5. 前端根据响应更新界面。

静态文件由 Web 服务器提供；API 通常以 JSON 交换数据。前端代码可以被用户查看，因此秘密和权限判断必须放在服务端。

## Python 对照

用 Python 写 Web 应用时，浏览器和服务器的边界依然存在。语言改变了，HTTP 请求、数据库和信任边界并没有改变。

## 动手验证

为“新增任务”画出从点击提交到页面出现新任务的 5 步数据流，并标出哪一步验证登录状态。

## 运行后检查

说明为什么隐藏一个按钮不能代替后端权限校验。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：从 Python 转向 TypeScript，先分清运行环境](/notes/typescript-01-learning-route) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：HTML、CSS 与 DOM：React 下面仍然是浏览器](/notes/typescript-03-html-css-dom)

