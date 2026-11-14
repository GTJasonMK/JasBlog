---
title: "Python 17：装饰器与上下文管理器：把公共动作放在合适的位置"
date: "2026-11-12"
excerpt: "计时、记录调用和释放锁都有公共动作，却不该一律包成装饰器。从函数调用和代码块的不同范围出发，解释装饰器怎样替换绑定、with 怎样保证清理，以及包装时需要保留哪些行为。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

好几个函数都要记录调用名称，把同样的打印语句复制到每个函数里，会让公共规则分散在许多地方。另一个问题看起来类似：文件用完要关闭、锁用完要释放。但后者要管理的可能只是函数中的某一段代码，不能都用同一种范围去包装。

装饰器适合围绕一个完整调用增加行为，上下文管理器则适合明确一段代码的进入和退出。先看最小的装饰器：

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

print(greet("Ada"))
```

定义 `greet` 以后，`@announce` 的效果近似于再执行 `greet = announce(greet)`。`announce` 接住原函数，定义一个记住它的包装函数，再返回包装函数。随后调用 `greet("Ada")`，实际先进入 `wrapper`，打印调用信息，再调用原函数并返回其结果。

这个例子会先输出“调用 greet”，然后输出“你好，Ada”。如果漏写 `return func(...)`，调用者得到的就成了 `None`。包装原函数时，输入如何转发、返回值是否保留、错误是否继续传播，都比 `@` 这个符号更值得检查。

## 包装函数也要保留原函数信息

`functools.wraps` 帮助复制名称、文档等元数据，并保留指向原函数的 `__wrapped__`。没有它，调试工具和框架可能只看到许多个都叫 `wrapper` 的函数，很难知道正在处理谁。

装饰器可以用于统一计时、注册处理器或缓存。但它也会影响函数的真实行为。缓存要求相同输入可以复用先前结果，依赖当前时间或外部状态的函数未必符合这个条件；包装异步函数时，也必须处理等待与异常传播，普通同步包装不一定合适。

堆叠装饰器还要关心顺序。`@outer` 放在 `@inner` 上方时，定义大致是 `outer(inner(func))`。把“校验后再缓存”变成“先返回缓存而绕过校验”，结果可能就不同。公共机制要让调用规则更明确，而不能把业务条件隐藏得难以追踪。

## 一段操作结束时，要做的事情

文件对象支持 `with`，因为它实现了进入和退出上下文的协议。进入时调用 `__enter__`，它的返回值绑定到 `as` 后面的名称；离开代码块时调用 `__exit__`，无论正常结束还是发生异常，都能执行约定的清理。

锁也支持这种用法：

```python
from threading import Lock

lock = Lock()
counter = 0
with lock:
    counter += 1
print(counter)      # 1
print(lock.locked()) # False
```

代码明确表达只有计数变化这段需要持锁。若在块里提前抛出异常，锁仍会按上下文约定释放。手写 `acquire()` 后，把 `release()` 放在普通下一行，一旦中间出错就可能永远走不到释放那里。

上下文管理并不保证被保护的操作成功，也不会自动撤销所有已经发生的副作用。锁释放后计数是否正确、数据库需要提交还是回滚，仍由具体资源的合同决定。

## 用生成器表达进入和退出

自定义上下文可以实现一对特殊方法，也可以用 `contextlib.contextmanager` 把简单流程写成一个生成器。下面这段只测量代码块的持续时间：

```python
from contextlib import contextmanager
from time import perf_counter

@contextmanager
def measured(label):
    started = perf_counter()
    try:
        yield
    finally:
        elapsed = perf_counter() - started
        print(f"{label}: {elapsed:.6f}s")

with measured("求和"):
    result = sum(range(100))
print(result)  # 4950
```

`yield` 前面的代码发生在进入时，代码块执行后再回到生成器。用 `finally` 包住退出动作，才能在代码块抛出异常时也测量结束时间。这里使用单调计时器观察持续时间，不依赖系统时钟是否被校准。

实现类形式的 `__exit__` 时，返回真值意味着异常被抑制；使用生成器形式捕获传回的异常却不再抛出，也可能让外部看不见失败。普通清理通常应让异常继续传播，不能因为资源已释放就把失败当成功。

如果目标是测量某个函数的每一次调用，装饰器可以统一应用；只想测量函数中某个阶段，就把这段包在 `with measured(...)` 里。先确定公共动作归属于整个调用还是局部代码块，再选工具，能避免为了复用两行代码而扩大副作用范围。

---

[上一篇：迭代器与生成器：数据不必一次准备好](/notes/python-16-iterators-generators) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：常用标准库：先看操作，再选工具](/notes/python-18-standard-library)

