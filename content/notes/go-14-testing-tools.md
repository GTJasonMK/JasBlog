---
title: "Go 14：表驱动测试与 Go 开发检查"
date: "2026-11-12"
excerpt: "同一条规则有几种输入时，我会把它们放进一张测试表。这样边界条件比较容易一起看见，也方便区分测试断言、竞态检查、覆盖率和基准各自说明了什么。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

同一条规则有几种输入时，我会把它们放进一张测试表。这样边界条件比较容易一起看见，也方便区分测试断言、竞态检查、覆盖率和基准各自说明了什么。

## 表驱动测试

测试文件以 _test.go 结尾，测试函数名以 Test 开头。表驱动测试适合用多个输入覆盖一个规则。

~~~go
func Add(a, b int) int { return a + b }

func TestAdd(t *testing.T) {
	tests := []struct {
		a, b, want int
	}{
		{1, 2, 3},
		{-1, 1, 0},
	}
	for _, tt := range tests {
		if got := Add(tt.a, tt.b); got != tt.want {
			t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
		}
	}
}
~~~

用 go test ./... 运行全部包，用 go test -cover ./... 查看语句覆盖率。覆盖率只说明代码被执行过，不证明断言检查了正确行为。

## 常用检查

~~~console
go fmt ./...
go vet ./...
go test -race ./...
go test -bench=. -benchmem ./...
~~~

go fmt ./... 会对模块中的 Go 包执行格式化；gofmt -w 则应传入 Go 源文件路径，例如 gofmt -w main.go，它本身不会递归遍历目录。竞态检测、静态检查和基准测试解决不同问题，不能互相替代。测试依赖外部服务时，应把快速单元测试与需要 Docker 或数据库的集成测试分开。

Go 还内置 fuzz testing，适合用来探索 JSON、协议解析和边界校验中的异常输入。模糊测试应保持目标函数无外部副作用，并把发现的问题转成固定回归用例。

## 动手验证

给[第 4 章](/notes/go-04-types-control)折扣函数增加全价、折扣、负数和边界输入测试。再写一个基准测试，比较不同输入规模下的成本。

---

[上一篇：后端常用标准库：I/O、JSON、时间与 HTTP](/notes/go-13-stdlib) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：HTTP 与 REST：状态码也是接口的一部分](/notes/go-15-http-rest)

