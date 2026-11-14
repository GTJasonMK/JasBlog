---
title: "Go 11：锁与 context：保护状态，传递取消"
date: "2026-11-12"
excerpt: "锁和 context 解决的是两类问题：前者保护共享状态，后者传递取消与截止时间。我会分别检查临界区有多大、调用链是否响应取消，避免把它们当成自动生效的保护。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

锁和 context 解决的是两类问题：前者保护共享状态，后者传递取消与截止时间。我会分别检查临界区有多大、调用链是否响应取消，避免把它们当成自动生效的保护。

## 同步状态

多个 goroutine 访问同一可变数据时，要么用锁保护，要么改为单所有者通过 channel 处理。互斥锁保护的是一段临界区，不是整个程序。一次性初始化可用 sync.Once；简单计数或状态可评估 sync/atomic，但复合状态通常仍需要锁。原子操作不能自动让多步业务更新成为一个整体。

~~~go
type SafeCounter struct {
	mu sync.Mutex
	n  int
}

func (c *SafeCounter) Add() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n++
}
~~~

用锁时尽量缩短临界区；不要持锁执行网络请求或等待不确定时长的操作。读多写少场景可以评估 RWMutex，但应先测量再优化。

## context 传播

context.Context 通常作为函数第一个参数。下游 HTTP、数据库或后台任务应使用调用者传入的 context，以便请求取消时停止工作。创建 WithTimeout 后要调用 cancel，释放计时器等资源。

~~~go
ctx, cancel := context.WithTimeout(parent, 2*time.Second)
defer cancel()
result, err := repository.Find(ctx, id)
~~~

不要把 context 长期存到结构体，也不要把业务参数塞进 context。取消信号是协作式的，代码必须检查 Done 或调用支持 context 的 API。

## 竞态检查

运行 go test -race ./... 可发现许多数据竞争，但它只能检查被测试运行路径实际触及的代码。

## 动手验证

给一个需要循环处理任务的 worker 加入 context 取消。取消后等待 worker 退出，确认不会遗留 goroutine。

---

[上一篇：goroutine 与 channel：启动之外还要负责退出](/notes/go-10-concurrency) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：值、引用、逃逸与垃圾回收](/notes/go-12-memory)

