---
title: "Python 17：装饰器与上下文管理器：把公共动作放在合适的位置"
date: "2026-11-12"
excerpt: "有些动作发生在函数调用前后，比如计时；有些动作发生在一段代码进入和退出时，比如释放锁。我会先区分这两个范围，再选择装饰器或上下文管理器。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

有些动作发生在函数调用前后，比如计时；有些动作发生在一段代码进入和退出时，比如释放锁。我会先区分这两个范围，再选择装饰器或上下文管理器。

装饰器接收函数并返回增强后的函数，适合统一计时、缓存或注册；不要把复杂业务藏进装饰器。`functools.wraps` 保留被包装函数的名称和文档。

```python
from functools import wraps


def announce(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper


@announce
def greet(name):
    return f"你好，{name}"
```

上下文管理器用 `with` 把资源的建立与释放绑定起来；文件对象是常见例子。自定义资源管理时可实现 `__enter__` / `__exit__`，简单场景可用 `contextlib.contextmanager`。

## 包装函数也要保留原函数信息

装饰器会改变函数对象。若不使用 `wraps`，文档工具、调试器和框架可能看到包装函数而非原函数。

## 动手验证

**练习：**如何保证无论代码是否异常，锁都会释放？

**答案：**使用锁对象的上下文管理器：`with lock:`，不要手工 `acquire()` 后忘记 `release()`。

---

[上一篇：迭代器与生成器：数据不必一次准备好](/notes/python-16-iterators-generators) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：常用标准库：先看操作，再选工具](/notes/python-18-standard-library)

