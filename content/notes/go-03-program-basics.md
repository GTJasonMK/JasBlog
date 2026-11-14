---
title: "Go 03：读懂 Go 程序：包、声明与入口"
date: "2026-11-12"
excerpt: "打开一个 Go 文件，我通常先看 package 和 import，再找类型声明与入口。这个顺序能先确定文件属于谁、依赖什么，再去读它具体做了什么。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

打开一个 Go 文件，我通常先看 package 和 import，再找类型声明与入口。这个顺序能先确定文件属于谁、依赖什么，再去读它具体做了什么。

同一个目录下的 Go 源文件通常属于同一个包。可执行程序使用 package main，并由 func main() 作为入口。包名是源码中的名字，模块路径是其他包导入它时使用的路径，两者相关但不是一回事。

~~~go
package main

import "fmt"

const serviceName = "order-api"

func main() {
	message := "启动 " + serviceName
	fmt.Println(message)
}
~~~

短变量声明 := 只能用于函数内部；包级变量和常量使用 var、const。标识符首字母大写表示对其他包可见，小写表示仅包内可见。Go 没有类继承式的访问修饰符。

声明变量但不显式赋值时会获得类型零值：数字为 0、bool 为 false、string 为空字符串，指针、map、slice、channel、函数和接口为 nil。零值可用性是 Go API 设计的重要部分；使用 nil 前要确认该类型的操作是否允许 nil。

## 阅读代码的顺序

先看 package 与 import，再看类型和常量声明，然后找入口函数或被测试的导出函数。理解导入路径能帮助定位模块边界，也能发现不必要的循环依赖。

## 声明、赋值和换行各有规则

- Go 的分号通常由编译器自动插入；不要把换行任意放在表达式中间。
- 未使用的局部变量和导入会导致编译失败，这是有意设计的反馈。
- := 如果左侧没有新变量，会报错；它不是赋值运算符 = 的通用替代。

## 动手验证

定义模块名、服务名称和端口常量，在 main 中打印服务启动信息。尝试把常量移到函数外，再将变量声明移到函数内，观察 := 的作用域限制。

---

[上一篇：Go 工具链与 Modules：先把运行环境对齐](/notes/go-02-toolchain) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：类型与流程控制：先明确数据能取什么值](/notes/go-04-types-control)

