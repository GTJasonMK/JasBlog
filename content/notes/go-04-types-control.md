---
title: "Go 04：类型与流程控制：先明确数据能取什么值"
date: "2026-11-12"
excerpt: "写金额、数量或状态判断时，我更在意类型和取值范围是否明确。Go 要求显式转换，正好提醒我们检查转换是否会溢出、截断，或者改变业务含义。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

写金额、数量或状态判断时，我更在意类型和取值范围是否明确。Go 要求显式转换，正好提醒我们检查转换是否会溢出、截断，或者改变业务含义。

Go 是静态类型语言。常见类型包括 bool、整数、浮点数、string，以及由 struct、数组、切片等构成的复合类型。不同数值类型之间通常需要显式转换，避免隐式精度损失。

~~~go
package main

import "fmt"

func discount(price int64, enabled bool) int64 {
	if !enabled || price < 0 {
		return price
	}
	return price * 9 / 10
}

func label(status int) string {
	switch status {
	case 1:
		return "paid"
	case 2:
		return "cancelled"
	default:
		return "pending"
	}
}

func main() {
	fmt.Println(discount(1000, true), label(1))
}
~~~

Go 只有 for 一种循环关键字；它可以写成传统计数循环，也可以省略初始化和后置语句来模拟 while。switch 默认不会贯穿到下一分支。

## 边界意识

业务金额不要用 float64 直接做货币计算。可用最小货币单位的整数，或经过审查的十进制定点数库。转换前要确认范围，防止溢出或截断。

## 动手验证

写一个函数，按订单状态返回可读标签；对未知状态返回明确的 unknown，并添加负金额保护。

---

[上一篇：读懂 Go 程序：包、声明与入口](/notes/go-03-program-basics) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：数组、切片、map 和字符串的边界](/notes/go-05-collections)

