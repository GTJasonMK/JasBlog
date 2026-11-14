---
title: "Go 13：后端常用标准库：I/O、JSON、时间与 HTTP"
date: "2026-11-12"
excerpt: "JSON解码器为什么既能读文件，也能读网络请求？从Reader与Writer的组合方式说明I/O，再追踪请求大小、字段校验、响应关闭与超时分别约束什么。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

同一段JSON可能来自文件、HTTP请求，也可能是测试里的一段字符串。若解析函数只接受文件路径，就把“数据从哪里来”和“数据是什么意思”绑到了一起。io.Reader把边界缩到读取字节的能力，解析器因此不必知道背后的来源。

## I/O 与 JSON

io.Reader 和 io.Writer 是可组合的接口，文件、网络连接、压缩器和编码器都能通过这些接口连接。处理大请求体时应流式读取并限制大小，不能默认把无限输入全部载入内存。

Reader一次Read不保证填满缓冲区，可能同时返回部分字节和错误；应先处理实际读取的n个字节，再判断结束。`io.ReadAll` 适合已知有界的小输入，`io.Copy` 适合在流之间搬运。按流读取降低一次性占用，却不会自动限制输入总量。

~~~go
type CreateOrderRequest struct {
	ProductID int64 `json:"product_id"` 
	Quantity  int   `json:"quantity"`
}
~~~

上面的 JSON tag 是结构体标签，告诉 encoding/json 如何映射字段。解码后仍要校验业务规则；JSON 语法正确不代表订单数量有效。

解码器只能填充导出字段。解出Quantity为0，还要判断这是明确传0，还是字段没提供；需要区分时用指针或专门输入类型。未知字段默认处理策略也要明确，必要时使用DisallowUnknownFields，并检查一次JSON值后没有多余内容。请求体上限与字段数量范围解决不同问题。

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

`Client.Do` 在收到404或500时通常仍返回有效响应和nil错误，所以必须检查StatusCode。返回响应以后由调用方关闭Body；若读取到EOF，连接通常更有机会复用，但不能为了复用无界读完整个恶意大响应。客户端与Transport应复用，让连接池真正发挥作用。

## 时间既有表示，也有测量

对外时间要明确时区和格式，存储时常选择UTC，展示时再转换。解析一个没有时区的字符串，无法凭空判断它代表哪个地区的时刻。统计耗时用 `time.Since(start)` 等保留单调时钟信息的方式，不靠两次格式化墙钟字符串相减。

Timeout和context共同限制等待，但设置一个超时并不决定重试是否安全。读取请求可以按合同重试，创建支付或订单仍需要幂等与状态查询。标准库提供机制，业务要决定机制对应的后果。

## 动手验证

解码创建订单 JSON，校验数量在 1 到 10 之间；再用一个带超时的客户端请求测试服务。

---

[上一篇：值、引用、逃逸与垃圾回收](/notes/go-12-memory) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：表驱动测试与 Go 开发检查](/notes/go-14-testing-tools)

