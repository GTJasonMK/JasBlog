---
title: "Python 18：常用标准库：先看操作，再选工具"
date: "2026-11-12"
excerpt: "碰到计数、分组或队列处理，我会先翻一下标准库。Counter、defaultdict、deque 解决的问题很具体，用它们通常比自己维护一套相同的状态更容易读。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

碰到计数、分组或队列处理，我会先翻一下标准库。Counter、defaultdict、deque 解决的问题很具体，用它们通常比自己维护一套相同的状态更容易读。

标准库优先解决常见基础任务，减少外部依赖。常用模块包括：

- `collections`: `Counter`、`defaultdict`、`deque`
- `itertools`: 组合迭代器
- `functools`: `lru_cache`、`partial`
- `statistics`: 简单统计
- `pathlib`, `json`, `csv`, `sqlite3`, `subprocess`

```python
from collections import Counter

words = "red blue red green blue red".split()
print(Counter(words).most_common(2))
```

选择数据结构时先根据操作判断：队列两端频繁增删用 `deque`；频率统计用 `Counter`；简单键计数可用普通字典。

## 相似名称不代表相同的数据结构

标准库的 `array.array` 与 NumPy 的多维 `ndarray` 不是一回事；数据分析和科学计算通常需要 NumPy。

## 动手验证

**练习：**统计 `"a b a c"` 中每个单词的次数。

```python
from collections import Counter
counts = Counter("a b a c".split())
print(counts["a"])  # 2
```

---

[上一篇：装饰器与上下文管理器：把公共动作放在合适的位置](/notes/python-17-decorators-context) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：正则、日期与时间：格式之外还有语义](/notes/python-19-regex-datetime)

