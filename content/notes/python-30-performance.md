---
title: "Python 30：性能与内存：先找到真正耗时的地方"
date: "2026-11-12"
excerpt: "看到循环多，我不会直接断定它就是瓶颈。程序可能大部分时间在等 I/O，也可能只是某个输入特别慢。先测出耗时和分配来自哪里，优化才有可以对照的结果。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

看到循环多，我不会直接断定它就是瓶颈。程序可能大部分时间在等 I/O，也可能只是某个输入特别慢。先测出耗时和分配来自哪里，优化才有可以对照的结果。

先测量，再优化。用 `timeit` 比较短表达式，`cProfile` 找程序级热点，`tracemalloc` 观察 Python 分配的内存。算法复杂度和 I/O 等待通常比微调语法更重要。

```python
from timeit import timeit

loop_time = timeit("sum(range(1000))", number=10_000)
print(loop_time)
```

常见做法：用内置操作和向量化库处理批量数据；对可迭代数据用生成器降低峰值内存；缓存纯函数的重复计算；减少无意义的网络往返。

## 缓存带来的状态成本也要计算

过早缓存会增加状态、内存和一致性问题。测试环境的微小差异也会影响计时；比较方案时保持输入和环境一致。

## 动手验证

**练习：**某函数整体很慢，下一步是先重写循环还是先采样分析？

**答案：**先用 profiler 找出实际耗时热点，再针对热点优化并重新测量。

---

[上一篇：描述符与元类：先看它们介入了哪一步](/notes/python-29-descriptors-metaclasses) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：线程、进程与 GIL：从任务在等什么说起](/notes/python-31-concurrency)

