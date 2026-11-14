---
title: "Python 08：函数、返回值与作用域"
date: "2026-11-12"
excerpt: "写函数时，我会先想清楚输入和输出。比如计算平均值，调用者需要拿到结果继续使用，所以应该返回数值；打印结果只是展示，不该和计算绑在一起。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

写函数时，我会先想清楚输入和输出。比如计算平均值，调用者需要拿到结果继续使用，所以应该返回数值；打印结果只是展示，不该和计算绑在一起。

函数用名字封装一项可复用操作。参数是输入，`return` 是结果；函数执行到末尾而没有 `return` 时返回 `None`。局部变量只在函数调用期间可见。

```python
def average(values):
    if not values:
        raise ValueError("至少需要一个数")
    return sum(values) / len(values)

print(average([3, 6, 9]))
```

函数应围绕一个清楚的职责命名。输入前提不满足时，抛出有意义的异常；不要用 `print` 代替返回值，因为调用者通常需要继续处理结果。

## 状态尽量通过参数和返回值传递

赋值语句会在当前作用域创建或重新绑定名称；不要为了修改外层变量滥用 `global`。优先把状态作为参数传入，并返回新结果。

## 动手验证

**练习：**写一个函数，返回文本中非空白单词的数量。

```python
def word_count(text):
    return len(text.split())
```

---

[上一篇：条件、循环与推导式：把处理过程写清楚](/notes/python-07-control-flow) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：参数、闭包与函数式工具](/notes/python-09-functions-advanced)

