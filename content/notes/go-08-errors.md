---
title: "Go 08：错误处理：让失败沿调用链说清楚"
date: "2026-11-12"
excerpt: "返回 error 之后，工作还没结束。调用者需要知道这是资源不存在、输入不合法，还是下游出了问题。我会保留错误原因，在有足够上下文的地方决定怎样记录和回复。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

返回 error 之后，工作还没结束。调用者需要知道这是资源不存在、输入不合法，还是下游出了问题。我会保留错误原因，在有足够上下文的地方决定怎样记录和回复。

## 错误是普通返回值

Go 常用“结果 + error”表达失败。调用者应检查错误，并决定是返回、转换为业务错误，还是在边界记录并回复客户端。

~~~go
func loadOrder(id int64) error {
	if id <= 0 {
		return fmt.Errorf("load order: invalid id %d", id)
	}
	return nil
}
~~~

需要判断错误类别时，可用自定义错误类型、哨兵错误和 errors.Is / errors.As，不要依靠字符串包含判断。

~~~go
if errors.Is(err, sql.ErrNoRows) {
	// 转换为业务上的“订单不存在”
}
~~~

## panic 的边界

panic 用于不可继续执行的程序错误或初始化失败等少数场景，不应代替普通校验和业务错误。recover 只能在同一 goroutine 的 deferred 函数中捕获 panic；HTTP 框架的恢复中间件只能保护请求 goroutine，不能自动保护你另外启动的后台 goroutine。

## 保留错误原因，也避免重复记录

- 错误包装时保留原错误：fmt.Errorf("query order: %w", err)。
- 不要重复记录同一错误并制造多条相同日志；在拥有足够请求上下文的边界记录。
- 不要吞掉错误后返回成功空值。

## 动手验证

定义“订单不存在”错误，在存储层包装错误，在 HTTP 边界用 errors.Is 将其映射为 404。

---

[上一篇：结构体、接口与泛型：先表达业务关系](/notes/go-07-structs-interfaces) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：包与依赖：让业务规则留在自己的位置](/notes/go-09-packages)

