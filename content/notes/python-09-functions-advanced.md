---
title: "Python 09：参数、闭包与函数式工具"
date: "2026-11-12"
excerpt: "一个函数有很多可选参数时，我更在意调用处能不能一眼看懂。让超时之类的选项必须按名字传入，常常比再补一段注释有效。默认参数的创建时机也值得单独看。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个函数有很多可选参数时，我更在意调用处能不能一眼看懂。让超时之类的选项必须按名字传入，常常比再补一段注释有效。默认参数的创建时机也值得单独看。

Python 函数可以接收位置参数、关键字参数、可变位置参数 `*args` 和可变关键字参数 `**kwargs`。用 `*` 后的参数强制关键字传入，能让调用更明确。

```python
def connect(host, port=5432, *, timeout=5):
    return f"{host}:{port} (timeout={timeout})"

print(connect("localhost", timeout=2))
```

闭包可以记住外层作用域中的值；`lambda` 适合极短的匿名函数。`map`、`filter`、`functools.partial` 等工具可用于组合操作，但列表推导式通常更易读。

## 可变默认参数会被重复使用

不要把列表或字典作为可变默认参数。默认值在函数定义时只创建一次：

```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

## 动手验证

**练习：**写一个函数，接受任意数量的数字并返回总和。

```python
def total(*numbers):
    return sum(numbers)
```

---

[上一篇：函数、返回值与作用域](/notes/python-08-functions) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：异常处理：在哪里接住失败](/notes/python-10-exceptions)

