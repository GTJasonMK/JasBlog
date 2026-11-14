---
title: "Go 专题 06：请求慢在哪里：DNS、TCP、TLS 与 Linux 网络"
date: "2026-11-12"
excerpt: "服务端只处理了十毫秒，客户端却等了一秒，多出来的时间在哪里？把DNS、连接、TLS与首字节等待拆开，结合Go连接复用和Linux资源寻找证据。"
tags: [ "Go", "进阶专题" ]
category: "go-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

服务端日志显示十毫秒，客户端却耗时一秒。两边可能都没有算错：服务端计时从请求进入Handler开始，客户端还经历了名称解析、连接建立、握手和代理等待。先统一计时范围，才知道该查哪一段。

## 为什么后端开发要学

HTTP 服务最终运行在操作系统的 socket 上。DNS 解析、TCP 建连、TLS 握手、连接复用和文件描述符耗尽，都会表现为接口变慢或连接失败；只调 Gin 路由通常解决不了这类问题。

## 网络路径

一次 HTTPS 请求通常经历名称解析、TCP 连接、TLS 握手、HTTP 请求和响应。连接池与 keep-alive 能复用连接，降低握手和端口消耗；代理和负载均衡会引入额外超时、连接池与转发头配置。TLS 在入口终止后，入口到后端的链路是否还加密要按威胁模型决定。

TCP 是字节流，不保留应用层消息边界。应用协议必须自行定义 framing；HTTP 已定义消息边界。连接关闭可能是正常 FIN，也可能是 RST 或超时，排查时应结合应用日志、连接状态和抓包证据。

一次Read可能只拿到一部分内容，也可能包含多个应用消息的数据，自定义协议要定义长度或分隔规则，不能把一次Write对应一次Read。HTTP客户端已经处理消息表示，业务仍需按响应长度与格式验证，不靠单次读取碰巧完整。

连接复用可以跳过部分建连与握手，但要求客户端和Transport复用、响应体按规则读取与关闭。每次请求新建独立Transport容易失去池收益；只关闭Body不读取剩余内容，也可能让某些连接无法复用。大响应则不能为了复用无界读取。

## Linux 资源与诊断

文件描述符上限、临时端口、socket backlog、DNS 配置和容器网络都可能形成容量边界。诊断时先区分 DNS、建连、TLS、服务端处理和下游等待各阶段，再使用 ss、curl、系统指标和 Go profile 收集证据。不要只通过增加超时掩盖连接泄漏或下游拥塞。

可以在自己的测试入口执行只读计时：

~~~console
curl -o /dev/null -sS -w 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} first=%{time_starttransfer} total=%{time_total}\n' https://example.com/
~~~

这些值通常从请求开始累计，阶段耗时要用差值解释，首字节时间也包含前面的网络过程。复用连接、重定向与代理会影响观察，一次curl不能代表应用池里的所有请求。Go中还可以用httptrace观察DNS、连接获取和复用事件。

大量TIME_WAIT不直接等于连接泄漏，可能是短连接多；大量长期在途连接则需结合状态、调用栈与超时检查。提高文件描述符上限只能扩大某一资源边界，不能修好忘关Body或下游无限等待。先建立具体证据，再调整系统参数。

## 动手验证

用 curl 分别查看 DNS、TCP、TLS 和首字节耗时；观察 Go HTTP 客户端复用连接前后的差异，并确认反向代理传来的转发头只信任配置过的代理。

---

[上一篇：比较 MySQL 与 PostgreSQL，我会看哪些问题](/notes/go-advanced-05-postgresql) · [Go 目录](/notes/go-00-learning-guide)

