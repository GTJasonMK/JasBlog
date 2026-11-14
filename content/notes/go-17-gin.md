---
title: "Go 17：用 Gin 写接口，业务边界仍要自己划"
date: "2026-11-12"
excerpt: "请求能绑定成结构体，为什么还不能直接创建订单？从Gin的路由和中间件出发，拆开格式解析、业务校验与响应映射，让订单规则能脱离HTTP测试。"
tags: [ "Go", "HTTP 与服务设计" ]
category: "go-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

同一个订单接口，使用标准库要手动处理路由、JSON和响应，Gin把不少重复动作集中起来。但请求能绑定为结构体，只说明数据进入了Go，不能证明用户有权购买、活动仍有效或库存足够。

## 最小服务

先在模块里执行 `go get github.com/gin-gonic/gin`。下面是main内部的路由片段，所需导入为Gin、net/http和log：

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

`gin.New()` 给出路由引擎，由调用方决定中间件；Recovery放在链上处理后续请求代码的panic。注册GET时保存的是处理函数，请求到来才执行。`c.JSON` 设置相应内容类型并序列化响应，写出后不能再把同一响应改成另一个状态。

Run 适合最小演示。生产服务应将 Router 交给配置完整的 http.Server，并实现超时、信号处理和优雅关闭，避免框架便捷启动方法隐藏生命周期控制。

## 路由与分层

用路由组表达 API 版本和认证边界，例如 /api/v1。Handler 负责协议转换：读取请求、调用业务服务、映射错误和响应。它不应直接写复杂 SQL 或承载订单状态机。

创建订单时可以按顺序做三步：用ShouldBindJSON读取输入并处理错误；从已验证身份得到userID，将商品与数量交给订单服务；把库存不足、资源缺失和系统失败映射为稳定响应。ShouldBind返回错误后要结束当前处理，不能继续使用半成品输入。

数量1到10属于字段范围，用户能否参与某活动则需要当前业务状态。规则应有明确的唯一来源，多个入口复用同一订单服务；Handler中的格式检查与业务层对有效命令的要求各有边界，避免把同一规则复制后逐渐写成两个版本。

传给下游的是 `c.Request.Context()`。不要把Gin上下文塞进长期任务或在请求结束以后继续使用它；异步工作应复制需要的业务值并交给独立生命周期管理。框架上下文的方便访问不等于它适合长期保存。

## 框架中间件覆盖不了所有失败

- Recovery 用来阻止请求 goroutine 的 panic 让整个进程退出，不会捕获其他 goroutine 的 panic。
- 不要直接把内部 error、SQL 语句或堆栈返回给客户端。
- 请求体解析后仍需校验业务规则、权限和资源归属。

测试纯规则时直接调用订单服务，测试路由时用httptest给Router发送请求，检查状态码和响应内容。前者定位业务，后者验证协议接线；只模拟一个成功JSON响应，无法证明订单真的落库或事务能回滚。

## 动手验证

增加一个创建订单路由，解析商品 ID 和数量，校验格式后调用一个普通 Go 函数；暂时用内存实现该函数。

---

[上一篇：net/http：请求处理、超时与优雅关闭](/notes/go-16-net-http) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：API 合同：字段、分页和幂等键怎么约定](/notes/go-18-api-contracts)

