---
title: "Python 27：浅拷贝与深拷贝：到底复制到了哪一层"
date: "2026-11-12"
excerpt: "复制一个二维列表后，里面的列表为什么还会一起变化？我会把外层容器和内层对象分别画出来：浅拷贝只换了外层，内部的引用关系仍然保留。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

复制一个二维列表后，里面的列表为什么还会一起变化？我会把外层容器和内层对象分别画出来：浅拷贝只换了外层，内部的引用关系仍然保留。

Python 名称绑定到对象。赋值只增加一个名称，不会自动复制容器。浅拷贝复制外层容器，但内部对象仍共享；深拷贝递归复制对象图，代价更高，也不适用于所有资源。

```python
import copy

original = [[1], [2]]
shallow = original.copy()
deep = copy.deepcopy(original)
original[0].append(9)
print(shallow[0])  # [1, 9]
print(deep[0])     # [1]
```

先明确需要共享还是隔离，再决定复制。不可变对象通常可安全共享；文件、锁、网络连接等资源不应随意深拷贝。

## 赋值只增加引用，不会复制容器

`list_a = list_b` 不是复制。可通过 `list_b.copy()` 或 `list(list_b)` 浅拷贝一层。

## 动手验证

**练习：**为什么复制一个二维列表后，修改内层列表仍会影响原列表？

**答案：**浅拷贝只创建新的外层列表，内层列表对象仍被两个外层列表共同引用。

---

[上一篇：Git、依赖与安全：守住几条输入边界](/notes/python-26-git-security) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：特殊方法：让自定义对象用起来像 Python 对象](/notes/python-28-data-model)

