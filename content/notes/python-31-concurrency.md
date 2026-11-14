---
title: "Python 31：线程、进程与 GIL：从任务在等什么说起"
date: "2026-11-12"
excerpt: "选择线程还是进程，我会先问任务主要在等网络，还是在做 CPU 计算。把瓶颈说清楚，再结合解释器版本和原生库的行为测试，比只记“Python 有 GIL”更有帮助。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

选择线程还是进程，我会先问任务主要在等网络，还是在做 CPU 计算。把瓶颈说清楚，再结合解释器版本和原生库的行为测试，比只记“Python 有 GIL”更有帮助。

并发让多个任务在时间上交错；并行则表示多个任务同时使用多个执行单元。I/O 密集任务通常适合线程，CPU 密集任务可考虑进程或原生向量化库。具体效果受 Python 实现、版本和工作负载影响。

```python
from concurrent.futures import ThreadPoolExecutor

def fetch_one(url):
    return f"已处理 {url}"

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(fetch_one, ["a", "b", "c"]))
```

进程间共享状态更复杂，通常通过队列或结果返回传递数据。线程共享内存，需保护并发修改的共享状态。不要先并发，再猜测是否更快。

## GIL 的结论要限定实现和构建方式

GIL 的具体行为属于 CPython 实现细节，并且会随版本和构建选项变化；不要把“有 GIL”简单等同于“Python 不能并行”。

## 动手验证

**练习：**批量下载网页和批量压缩图片，分别优先考虑什么？

**答案：**下载主要等待网络，可先考虑线程或异步 I/O；压缩主要耗 CPU，可测量进程池或原生库方案。

---

[上一篇：性能与内存：先找到真正耗时的地方](/notes/python-30-performance) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：asyncio：await 在什么地方让出执行权](/notes/python-32-asyncio)

