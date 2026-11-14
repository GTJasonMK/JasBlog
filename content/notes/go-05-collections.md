---
title: "Go 05：数组、切片、map 和字符串的边界"
date: "2026-11-12"
excerpt: "切片赋值之后改了元素，另一个切片为什么也变了？我会先看它们是否共用底层数组，再看长度和容量。map 与字符串也有各自的边界，不能只按表面语法判断。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

切片赋值之后改了元素，另一个切片为什么也变了？我会先看它们是否共用底层数组，再看长度和容量。map 与字符串也有各自的边界，不能只按表面语法判断。

## 切片

切片包含指向底层数组的引用、长度和容量。复制切片变量并不一定复制元素；两个切片可能共享底层数组。需要独立数据时使用 slices.Clone（Go 1.21 起）或显式复制。

~~~go
values := []int{10, 20, 30}
view := values[:2]
view[0] = 99 // values[0] 也变为 99
copyOfValues := append([]int(nil), values...)
~~~

追加时如果容量不足，运行时会分配新数组，因此不要依赖扩容后的底层地址。

## 映射

~~~go
counts := map[string]int{"ok": 2}
counts["failed"]++

value, exists := counts["missing"]
if !exists {
	fmt.Println("没有该键", value)
}
~~~

读取不存在的键会得到零值，所以需要用逗号 ok 判断键是否存在。普通 map 不能被多个 goroutine 同时读写；并发场景需要互斥锁或适当的并发结构。

nil map 可以安全读取，但不能写入；写入前要用 make 或 map 字面量初始化。map 的遍历顺序未定义，测试和业务逻辑不能依赖某次迭代顺序。

## 字符串

字符串是字节序列，UTF-8 下一个汉字通常占多个字节。按字符处理时要使用 range 或 []rune；按协议长度或网络数据处理时往往要按字节。

## 动手验证

统计一段文本中每个 Unicode 字符的出现次数。再尝试用 len(text) 统计汉字数量，解释为什么结果与字符数不同。

---

[上一篇：类型与流程控制：先明确数据能取什么值](/notes/go-04-types-control) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：函数、方法与指针接收者怎么选](/notes/go-06-functions-methods)

