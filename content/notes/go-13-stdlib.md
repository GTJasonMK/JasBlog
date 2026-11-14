---
title: "Go 13：后端常用标准库：I/O、JSON、时间与 HTTP"
date: "2026-11-12"
excerpt: "io.Reader 和 io.Writer 是我理解 Go I/O 的一个入口。文件、连接和编码器可以通过这两个小接口组合起来，而请求大小、超时和业务字段仍需要在边界单独控制。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

io.Reader 和 io.Writer 是我理解 Go I/O 的一个入口。文件、连接和编码器可以通过这两个小接口组合起来，而请求大小、超时和业务字段仍需要在边界单独控制。

## I/O 与 JSON

io.Reader 和 io.Writer 是可组合的接口，文件、网络连接、压缩器和编码器都能通过这些接口连接。处理大请求体时应流式读取并限制大小，不能默认把无限输入全部载入内存。

~~~go
type CreateOrderRequest struct {
	ProductID int64 `json:"product_id"` 
	Quantity  int   `json:"quantity"`
}
~~~

上面的 JSON tag 是结构体标签，告诉 encoding/json 如何映射字段。解码后仍要校验业务规则；JSON 语法正确不代表订单数量有效。

## 时间与网络请求

服务器侧优先使用带 context 和明确超时的 HTTP Client。不要为每次请求新建没有超时的默认客户端。处理时间时统一时区策略；数据库中通常保存 UTC 时间，再按展示规则格式化。

~~~go
client := &http.Client{Timeout: 3 * time.Second}
req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
if err != nil {
	return err
}
resp, err := client.Do(req)
if err != nil {
	return err
}
defer resp.Body.Close()
if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
	return fmt.Errorf("unexpected response status: %s", resp.Status)
}
~~~

## 动手验证

解码创建订单 JSON，校验数量在 1 到 10 之间；再用一个带超时的客户端请求测试服务。

---

[上一篇：值、引用、逃逸与垃圾回收](/notes/go-12-memory) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：表驱动测试与 Go 开发检查](/notes/go-14-testing-tools)

