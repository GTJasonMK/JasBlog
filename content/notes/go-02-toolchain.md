---
title: "Go 02：Go 工具链与 Modules：先把运行环境对齐"
date: "2026-11-12"
excerpt: "文件能单独运行，换成go run .却失败，差别在哪里？从一个最小模块说明工具链、模块路径与包的关系，再区分依赖版本记录、内容校验和源码格式化。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

只有一个文件时，`go run main.go` 很容易运行；后来把函数移到同目录另一个文件，再执行同一命令却说函数未定义。原因是这个命令只编译列出的文件，而 `go run .` 会构建当前包中符合条件的源文件。先理解工具正在构建什么，才好判断错误属于代码还是运行方式。

一个模块以 `go.mod` 为根，里面可以包含多个包。模块路径是包导入路径的前缀，例如模块是 `example.com/hello-go`，子目录 `internal/order` 的导入路径便从这个前缀继续展开。它是模块身份，不要求教学例子先有一个真实域名。

## 从空目录运行一个包

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

这里的 `package main` 与 `main` 函数让当前包成为可执行程序。`go run .` 构建后临时运行，`go build .` 留下可执行文件；普通库包不因此产生可运行的主程序。`gofmt` 统一源文件格式，不改变业务含义，减少团队在排版上的分歧。

## 两个依赖文件分别证明什么

`go.mod` 声明模块身份、Go版本要求和依赖要求。`go.sum` 保存下载模块内容的校验值，帮助验证内容一致，它不是“安装过的全部依赖列表”，也不能单独表达最终构建选中了哪些版本。直接手改校验值，只会跳过定位内容不一致的真正原因。

源码实际使用了依赖以后，用 `go mod tidy` 整理声明；需要有意升级某个模块时，用 `go get` 并查看差异。把两个文件一起提交，让另一台机器从相同模块声明开始构建。模块缓存与工具下载通常位于Go管理的目录，不必把项目源码塞进旧式GOPATH布局。

## 模块路径和工具版本要一致

- 准备公开分发的模块通常使用实际仓库路径；改模块路径时，内部导入也要一起修改。
- 不要手工编辑 go.sum 来“修复”依赖问题；应通过 go get、go mod tidy 等命令管理。
- Go 工具、IDE 和终端应使用同一套 Go 安装，否则会出现版本不一致。

`go version` 显示当前调用的工具链，`go env GOMOD GOWORK GOTOOLCHAIN` 可以帮助确认模块、工作区与工具链选择。现代Go可能按模块要求自动选择工具链，因此“机器装了哪个版本”与“这次构建实际用了哪个版本”也要核对。遇到导入失败，先检查当前目录和模块路径，再看代理、网络或私有仓库权限。

## 动手验证

新建一个模块，运行程序，再执行 go test ./...。此时没有测试文件也应正常结束。

把打印函数移到同包的 `message.go`，分别运行 `go run main.go` 和 `go run .`。前者若没有包含函数所在文件会失败，后者应仍能找到它。这个小实验能区分按文件构建与按包构建，后面写测试和组织目录都需要这个区别。

---

[上一篇：学 Go 后端，我会先把请求走过的路径画出来](/notes/go-01-roadmap) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：读懂 Go 程序：包、声明与入口](/notes/go-03-program-basics)

