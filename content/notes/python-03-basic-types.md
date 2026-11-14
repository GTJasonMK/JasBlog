---
title: "Python 03：数字、真假值与类型转换"
date: "2026-11-12"
excerpt: "做类型转换时，我最关心的不是能不能转，而是转换会丢掉什么信息。小数转整数会截断，浮点数也不适合直接承担精确金额计算，这些都得先说清楚。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

做类型转换时，我最关心的不是能不能转，而是转换会丢掉什么信息。小数转整数会截断，浮点数也不适合直接承担精确金额计算，这些都得先说清楚。

Python 常用内置标量包括 `int`、`float`、`bool`、`str` 和 `None`。整数精度不限于固定 32/64 位；浮点数则遵循二进制浮点近似，金额通常用 `decimal.Decimal` 或以“分”为单位的整数。

```python
print(7 / 2)       # 3.5
print(7 // 2)      # 3，向下取整
print(7 % 2)       # 1
print(int("12"))   # 12
print(bool([]))    # False
```

空列表、空字符串、`0`、`0.0`、`None` 都是假值；非空容器通常是真值。`bool(value)` 会显式得到真假值，但不必在 `if` 前重复转换。

## 转换可能截断，也可能失败

`int(3.9)` 会截去小数部分，不是四舍五入。字符串转数值可能失败，应该让 `ValueError` 明确暴露，或在输入边界捕获并提示用户。

## 动手验证

**练习：**安全判断一个可选名称是否有非空文本。

```python
name = "  Ada  "
if name and name.strip():
    print(name.strip())
```

---

[上一篇：变量、对象与赋值：改的是名字，还是对象](/notes/python-02-objects) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：字符串：从切片到编码和格式化](/notes/python-04-strings)

