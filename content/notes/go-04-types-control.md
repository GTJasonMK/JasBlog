---
title: "Go 04：类型与流程控制：先明确数据能取什么值"
date: "2026-11-12"
excerpt: "金额是整数就能放心乘折扣吗？从一次九折计算看类型范围、整数截断和错误返回，再用状态分支说明未知输入为什么不能默认变成待支付。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

商品1000分，打九折得到900分，写成 `price * 9 / 10` 看起来很直接。但当price接近整数上限，中间的乘9就可能溢出，最后再除10也救不回来。类型决定能表达的范围，计算顺序也会影响结果。

Go在编译时检查类型。`int` 的位数随目标架构变化，`int64` 则固定宽度；不同数值类型通常需要显式转换。显式转换能让操作可见，却不会自动检查溢出，浮点转整数还会截去小数部分。业务边界仍要自己验证。

下面金额统一以分为单位，负数返回错误。把整数拆成商与余数以后，仍得到向下取整的九折价，同时避免先乘9导致中间溢出：

~~~go
package main

import (
	"errors"
	"fmt"
)

func discount(price int64, enabled bool) (int64, error) {
	if price < 0 {
		return 0, errors.New("金额不能为负")
	}
	if !enabled {
		return price, nil
	}
	return price/10*9 + price%10*9/10, nil
}

func label(status int) string {
	switch status {
	case 1:
		return "paid"
	case 2:
		return "cancelled"
	case 0:
		return "pending"
	default:
		return "unknown"
	}
}

func main() {
	price, err := discount(1000, true)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(price, label(1))
}
~~~

结果是 `900 paid`。金额1001分会得到900分，这里明确采用对非负结果向下取整的演示规则。真实促销如果要求四舍五入、逐项折扣或整单折扣，应把规则与测试一起改，不能让整数除法碰巧决定结算政策。

状态分支把0、1、2映射为已知值，其余返回unknown。原本若把default一律当pending，一个不存在的状态也会获得合法业务含义。未知输入应该保留为未知或直接报错，不能用方便的默认值掩盖问题。

## 条件成立以后，哪一段会执行

if要求bool条件，数字0不会自动当false；`&&` 与 `||` 从左到右短路，因此可以先判断指针非nil，再访问字段。switch默认只执行匹配分支，不自动进入下一case；需要fallthrough时必须明确写出，但多数状态判断用不到。

Go只有for一种循环关键字，可以写计数循环、仅条件循环和无条件循环。range遍历集合更直接，break退出当前循环，continue跳到下一次。多层循环中的退出目标需要明确，必要时拆出函数，比靠多个标志变量传递状态更容易检查。

## 边界意识

业务金额不要用 float64 直接做货币计算。可用最小货币单位的整数，或经过审查的十进制定点数库。转换前要确认范围，防止溢出或截断。

使用整数分也需要币种和金额上限。不同币种的最小单位并不相同；含税计算和汇率还可能要求更高精度。类型只是表示，业务含义要由合同补齐。

## 动手验证

检查金额0、1000、1001、负数与int64最大值，并分别说明期望结果。再给label传入未知状态，确认它不会被解释成pending。先写出期望再运行，才能验证规则而不只是验证没有崩溃。

---

[上一篇：读懂 Go 程序：包、声明与入口](/notes/go-03-program-basics) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：数组、切片、map 和字符串的边界](/notes/go-05-collections)

