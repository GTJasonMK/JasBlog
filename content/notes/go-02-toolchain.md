---
title: "Go 02：Go 工具链与 Modules：先把运行环境对齐"
date: "2026-11-12"
excerpt: "新建项目时，我先确认终端实际调用的 Go 版本，再创建模块。模块路径、包名和源码所在目录各有作用，分清它们之后，很多导入问题就能顺着路径查下去。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

新建项目时，我先确认终端实际调用的 Go 版本，再创建模块。模块路径、包名和源码所在目录各有作用，分清它们之后，很多导入问题就能顺着路径查下去。

Go Modules 是项目依赖和版本的基础。go.mod 记录模块路径和依赖，go.sum 校验依赖内容。GOPATH 仍可能出现在缓存和旧工具配置里，但新项目应使用模块，不必把源码放进固定的 GOPATH 目录。

~~~console
go version
mkdir hello-go
cd hello-go
go mod init example.com/hello-go
~~~

保存为 main.go：

~~~go
package main

import "fmt"

func main() {
	fmt.Println("Hello, Go")
}
~~~

~~~console
go run .
go build .
gofmt -w main.go
~~~

go run 适合开发时快速运行，go build 生成可执行文件。gofmt 是 Go 的标准格式化工具，团队应把格式化纳入提交流程。

## 模块路径和工具版本要一致

- go mod init 的模块路径要与仓库地址相符，之后的内部导入也会使用它。
- 不要手工编辑 go.sum 来“修复”依赖问题；应通过 go get、go mod tidy 等命令管理。
- Go 工具、IDE 和终端应使用同一套 Go 安装，否则会出现版本不一致。

## 动手验证

新建一个模块，运行程序，再执行 go test ./...。此时没有测试文件也应正常结束。

---

[上一篇：学 Go 后端，我会先把请求走过的路径画出来](/notes/go-01-roadmap) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：读懂 Go 程序：包、声明与入口](/notes/go-03-program-basics)

