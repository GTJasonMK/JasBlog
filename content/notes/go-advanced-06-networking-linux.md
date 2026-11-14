---
title: "Go 专题 06：请求慢在哪里：DNS、TCP、TLS 与 Linux 网络"
date: "2026-11-12"
excerpt: "接口慢不一定慢在 Handler。我会把 DNS、建连、TLS、服务端处理和下游等待分开计时，先确认时间花在哪里，再去看连接复用或系统资源限制。"
tags: [ "Go", "进阶专题" ]
category: "go-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

接口慢不一定慢在 Handler。我会把 DNS、建连、TLS、服务端处理和下游等待分开计时，先确认时间花在哪里，再去看连接复用或系统资源限制。

## 为什么后端开发要学

HTTP 服务最终运行在操作系统的 socket 上。DNS 解析、TCP 建连、TLS 握手、连接复用和文件描述符耗尽，都会表现为接口变慢或连接失败；只调 Gin 路由通常解决不了这类问题。

## 网络路径

一次 HTTPS 请求通常经历名称解析、TCP 连接、TLS 握手、HTTP 请求和响应。连接池与 keep-alive 能复用连接，降低握手和端口消耗；代理和负载均衡会引入额外超时、连接池与转发头配置。TLS 在入口终止后，入口到后端的链路是否还加密要按威胁模型决定。

TCP 是字节流，不保留应用层消息边界。应用协议必须自行定义 framing；HTTP 已定义消息边界。连接关闭可能是正常 FIN，也可能是 RST 或超时，排查时应结合应用日志、连接状态和抓包证据。

## Linux 资源与诊断

文件描述符上限、临时端口、socket backlog、DNS 配置和容器网络都可能形成容量边界。诊断时先区分 DNS、建连、TLS、服务端处理和下游等待各阶段，再使用 ss、curl、系统指标和 Go profile 收集证据。不要只通过增加超时掩盖连接泄漏或下游拥塞。

## 动手验证

用 curl 分别查看 DNS、TCP、TLS 和首字节耗时；观察 Go HTTP 客户端复用连接前后的差异，并确认反向代理传来的转发头只信任配置过的代理。

---

[上一篇：比较 MySQL 与 PostgreSQL，我会看哪些问题](/notes/go-advanced-05-postgresql) · [Go 目录](/notes/go-00-learning-guide)

