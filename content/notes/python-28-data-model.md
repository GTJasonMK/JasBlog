---
title: "Python 28：特殊方法：让自定义对象用起来像 Python 对象"
date: "2026-11-12"
excerpt: "一个自定义集合如果能直接交给 len 和 for，调用处就不需要记住另一套方法名。我只会实现这个对象确实需要的协议，让语法和对象的含义对得上。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个自定义集合如果能直接交给 len 和 for，调用处就不需要记住另一套方法名。我只会实现这个对象确实需要的协议，让语法和对象的含义对得上。

Python 的许多语法通过对象的数据模型工作：`len(x)` 调用 `x.__len__()`，`a + b` 可能调用 `a.__add__(b)`，`for` 使用迭代协议。特殊方法主要由语言调用，通常通过内置语法使用，而不是直接调用。

```python
class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __iter__(self):
        return iter(self._songs)


playlist = Playlist(["A", "B"])
print(len(playlist))
```

实现常见协议能让自定义对象自然融入 Python。只实现调用者需要的行为，不要为了“完整”堆砌特殊方法。

## 相等比较和哈希要遵守同一套规则

`__repr__` 面向调试，`__str__` 面向展示。特殊方法行为应符合预期，例如 `__eq__` 相等时哈希规则也必须一致。

## 动手验证

**练习：**让 `Playlist` 支持 `"A" in playlist`。

**答案：**实现 `__contains__`，或让 Python 通过迭代协议逐项检查；只有性能或语义需要时才显式实现。

---

[上一篇：浅拷贝与深拷贝：到底复制到了哪一层](/notes/python-27-references-copy) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：描述符与元类：先看它们介入了哪一步](/notes/python-29-descriptors-metaclasses)

