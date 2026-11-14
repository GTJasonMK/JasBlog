---
title: "Go 17：用 Gin 写接口，业务边界仍要自己划"
date: "2026-11-12"
excerpt: "Gin 能省掉不少路由和绑定代码，但它不替我决定权限、事务和订单状态。我的划分是让 Handler 做协议转换，把真正的业务判断留给普通 Go 函数或服务。"
tags: [ "Go", "HTTP 与服务设计" ]
category: "go-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Gin 能省掉不少路由和绑定代码，但它不替我决定权限、事务和订单状态。我的划分是让 Handler 做协议转换，把真正的业务判断留给普通 Go 函数或服务。

## 最小服务

先通过 Go Modules 安装 Gin，再创建路由：

~~~go
router := gin.New()
router.Use(gin.Recovery())

router.GET("/healthz", func(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
})

if err := router.Run(":8080"); err != nil {
	log.Fatal(err)
}
~~~

大型服务通常使用 gin.New 并显式挂载经过配置的中间件，以便控制日志格式和脱敏策略。Gin 的 ShouldBind 系列可解析请求，但结构体校验不等于业务校验；例如数量必须为正数仍要在业务层确认。

Run 适合最小演示。生产服务应将 Router 交给配置完整的 http.Server，并实现超时、信号处理和优雅关闭，避免框架便捷启动方法隐藏生命周期控制。

## 路由与分层

用路由组表达 API 版本和认证边界，例如 /api/v1。Handler 负责协议转换：读取请求、调用业务服务、映射错误和响应。它不应直接写复杂 SQL 或承载订单状态机。

## 框架中间件覆盖不了所有失败

- Recovery 用来阻止请求 goroutine 的 panic 让整个进程退出，不会捕获其他 goroutine 的 panic。
- 不要直接把内部 error、SQL 语句或堆栈返回给客户端。
- 请求体解析后仍需校验业务规则、权限和资源归属。

## 动手验证

增加一个创建订单路由，解析商品 ID 和数量，校验格式后调用一个普通 Go 函数；暂时用内存实现该函数。

---

[上一篇：net/http：请求处理、超时与优雅关闭](/notes/go-16-net-http) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：API 合同：字段、分页和幂等键怎么约定](/notes/go-18-api-contracts)

