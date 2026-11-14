---
title: "Go 16：net/http：请求处理、超时与优雅关闭"
date: "2026-11-12"
excerpt: "路由函数已经返回，连接和后台任务会不会自动结束？沿net/http的Handler、响应写入与Server生命周期，区分超时、大小上限、资源关闭和优雅退出。"
tags: [ "Go", "HTTP 与服务设计" ]
category: "go-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个HTTP服务既要回答请求，也要管理连接。Handler只处理当前请求；慢速发送请求头、长时间保持空闲连接、进程收到终止信号，都是Handler之外仍然会发生的事。只写一个路由函数，还没有定义整个服务怎样运行。

## Handler

Handler 接收 ResponseWriter 和 Request。请求体按流消费；服务端会在请求处理后关闭 Request.Body，Handler 通常不需要关闭它。对外服务应限制请求体大小，并设置服务器读写超时。ReadHeaderTimeout 限制读取请求头的时间，ReadTimeout 限制读取整个请求（包括请求体）的总时间，WriteTimeout 限制响应写入时间，IdleTimeout 限制 keep-alive 空闲连接。请求体大小上限与超时保护的是不同资源；流式上传等场景要单独设计超时策略。

HTTP 客户端返回的响应体必须由调用方关闭；出站请求体通常由 Transport 负责关闭。若要让连接可复用，响应体通常需要读到 EOF；错误响应体未读完就关闭时可以释放资源，但该连接可能无法复用。大响应体不要为了复用而无界读取。

~~~go
func health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if _, err := io.WriteString(w, "{\"status\":\"ok\"}"); err != nil {
		log.Printf("write health response: %v", err)
	}
}

func newServer() *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", health)
	return &http.Server{
		Addr:              ":8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}
~~~

实际程序中还要检查 ListenAndServe 返回值，处理 SIGTERM 并调用 Shutdown，让正在处理的请求有机会结束。

方法模式 `GET /healthz` 使用Go 1.22起的ServeMux路由能力。可以用httptest创建请求和ResponseRecorder，不启动真实端口就检查状态码、Content-Type和JSON；检查路由本身时，把请求交给mux，而不只直接调用health函数。

Header必须在WriteHeader或首次Write之前设置。没显式写状态时，首次写出内容通常隐式使用200；响应已经开始后，再想改成500通常来不及。因此先完成可能失败的解析和业务步骤，再确定响应，写出失败则记录传输问题，不能重新假装发送另一份完整JSON。

绑定请求体时可用 http.MaxBytesReader 限制大小。反向代理后要正确配置可信代理来源，不能无条件相信客户端提供的 X-Forwarded-For 或 X-Forwarded-Proto。

## 中间件

中间件也是 Handler，可以在调用下一个 Handler 前后记录日志、检查身份或设置请求标识。中间件应该有明确顺序；认证和授权不能只靠前端隐藏按钮。

超时机制各有范围。服务器写超时约束连接写入，不会自动中断仍在计算的业务goroutine；业务调用仍应传播请求context并响应取消。流式响应需要单独规划，不能直接套一个很短的普通响应超时。

## 退出时先给请求收尾机会

Shutdown先关闭监听器与空闲连接，再等待活动请求结束，直到传入context到期。ListenAndServe因此返回ErrServerClosed属于预期关闭，其他监听错误应报告。调用Shutdown的清理流程要等到完成，不能启动一个goroutine后main立即退出。

升级或劫持的连接、独立worker与消费者不全由Shutdown管理，应用仍需分别停止并等待。关闭HTTP以后再关数据库，可以让尚在处理的请求完成提交；顺序反过来，就可能把正常退出变成请求失败。

## HTTP 客户端

复用 http.Client 和 Transport，并设置超时。将请求 context 传给 NewRequestWithContext；检查响应状态码，并关闭响应体。只读部分响应体时也要处理连接复用要求。

## 动手验证

使用标准库写 /healthz 路由，给服务器添加超时配置，并实现收到 SIGTERM 后优雅关闭。

---

[上一篇：HTTP 与 REST：状态码也是接口的一部分](/notes/go-15-http-rest) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：用 Gin 写接口，业务边界仍要自己划](/notes/go-17-gin)

