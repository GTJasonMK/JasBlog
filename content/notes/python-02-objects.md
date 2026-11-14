---
title: "Python 02：变量、对象与赋值：改的是名字，还是对象"
date: "2026-11-12"
excerpt: "我理解 Python 变量时，习惯先画出名称与对象之间的指向关系。给变量重新赋值，和通过变量修改一个列表，是两件不同的事。下面这组对照能直接看出区别。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我理解 Python 变量时，习惯先画出名称与对象之间的指向关系。给变量重新赋值，和通过变量修改一个列表，是两件不同的事。下面这组对照能直接看出区别。

```python
count = 3
other = count
count = 4
print(other)  # 3

items = ["a"]
alias = items
alias.append("b")
print(items)  # ['a', 'b']
```

整数重新绑定后，`other` 仍指向原来的整数对象；列表是可变对象，两个名称指向同一个列表，所以通过任一名称修改都会看到变化。`type(x)` 查看类型，`id(x)` 可用于观察对象身份，但不应把 `id` 当作持久标识。

## 值相等，不代表是同一个对象

`a == b` 比较值，`a is b` 比较是否为同一个对象。通常用 `is None` 检查空值；比较字符串或数字的值应使用 `==`。

## 动手验证

**练习：**预测下面打印什么。

```python
a = [1]
b = a
b = b + [2]
print(a, b)
```

**答案：**`[1] [1, 2]`。`b + [2]` 创建新列表，再把 `b` 绑定到新对象；原列表没有被原地修改。

---

[上一篇：先把解释器和运行方式弄清楚](/notes/python-01-environment) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：数字、真假值与类型转换](/notes/python-03-basic-types)

