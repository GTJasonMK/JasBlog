---
title: "Go 19：配置、日志与服务的启动和关闭"
date: "2026-11-12"
excerpt: "服务上线前，我会顺着启动和关闭各走一遍：缺少配置是否会直接失败，请求能否关联到日志，收到终止信号后又是谁停止接流量、谁关闭资源。"
tags: [ "Go", "HTTP 与服务设计" ]
category: "go-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

服务上线前，我会顺着启动和关闭各走一遍：缺少配置是否会直接失败，请求能否关联到日志，收到终止信号后又是谁停止接流量、谁关闭资源。

## 配置

本地、测试和生产环境的端口、数据库地址、超时等配置不同，应通过环境变量或受控配置文件提供。配置加载时做显式校验，缺少必需值就启动失败。密码、令牌和私钥不能提交到仓库，也不应打印到日志。

## 结构化日志

Go 标准库 slog 可输出结构化字段，便于日志平台过滤。日志要带请求 ID、路由、状态码和耗时；不要记录密码、完整认证头、支付密钥或未经脱敏的个人信息。

## 生命周期

服务启动后要能响应健康检查，并监听 SIGINT/SIGTERM。关闭时先停止接受新流量，再让正在处理的请求在限定时间内结束，最后关闭数据库、消息消费者等资源。清理函数应明确报错，不能静默忽略关键资源关闭失败。

~~~go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
if err := server.Shutdown(ctx); err != nil {
	return fmt.Errorf("shutdown http server: %w", err)
}
~~~

## 动手验证

定义端口、数据库连接地址和服务关闭超时三项配置。缺少端口或连接地址时让程序报出可理解的启动错误。

---

[上一篇：API 合同：字段、分页和幂等键怎么约定](/notes/go-18-api-contracts) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：认证、授权与 Web 安全的几条边界](/notes/go-20-security)

