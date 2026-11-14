---
title: "TypeScript 41：Node.js 服务：配置、入口与进程生命周期"
date: "2026-11-12"
excerpt: "一个长期运行的 API，不只是执行完就退出的脚本。我会在入口集中读取并校验配置，在收到终止信号时停止接请求，再按顺序释放连接等资源。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个长期运行的 API，不只是执行完就退出的脚本。我会在入口集中读取并校验配置，在收到终止信号时停止接请求，再按顺序释放连接等资源。

Node.js 用 V8 执行 JavaScript，并提供文件、环境变量、网络等服务端 API。服务端进程启动后持续监听请求，收到终止信号时应释放资源。不要在业务模块里散落环境变量读取。

TypeScript 项目可由开发工具执行 TS，也可先构建 JS 再运行；开发和生产应使用清晰一致的脚本。路径、文件系统和进程 API 仅在 Node 环境可用。

收到 SIGTERM 时停止接受新请求，等待正在处理的请求结束，并关闭 HTTP server 和 Prisma 连接。设置有限的关闭超时；超时后让进程管理器回收进程，避免部署时旧实例无限挂起。

## 运行环境和配置值都要显式确认

- 浏览器对象如 window、document 在 Node 中不存在。
- 环境变量值都是字符串，不能直接假定为数字或布尔值。
- 进程异常退出时，应保留错误并让运行平台发现失败。

## 动手验证

写一个 Node 程序读取 PORT 环境变量、校验端口范围并打印服务将监听的地址。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：登录页面与受保护路由](/notes/typescript-40-auth-ui) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：Express 中间件：请求沿什么顺序被处理](/notes/typescript-42-express)

