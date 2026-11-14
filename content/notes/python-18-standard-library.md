---
title: "Python 18：常用标准库：先看操作，再选工具"
date: "2026-11-12"
excerpt: "数词频、按类别分组、从队首取任务，看起来都能用列表和字典凑出来，标准库却提供了更直接的表达。沿着这些操作理解 Counter、defaultdict、deque，以及迭代、统计和缓存工具的使用条件。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

想知道一段文本里哪个词出现最多，可以建一个字典，逐个检查键是否存在，再累加次数。这当然能做，只是这套操作太常见了，Python已经把它放进标准库。直接写出“计数”，读代码的人就不必先还原那段维护字典的过程。

```python
from collections import Counter

words = "red blue red green blue red".split()
print(Counter(words).most_common(2))
```

结果是 `[('red', 3), ('blue', 2)]`。`Counter` 是带计数语义的字典工具，输入中的各个元素成为键，次数成为值。读取未出现的元素时返回0，适合词频、状态分布或简单事件计数。

输入仍然要符合前提：元素需要可哈希，文本怎么切成词也由前一步决定。`Counter("hello")` 统计的是字符，`Counter("hello world".split())` 才是在这个空白拆分规则下统计词。工具把计数做对，不代表前面的数据含义自动正确。

## 缺失时创建一个容器

如果每个分类要收集多个名字，使用 `defaultdict` 可以把默认值的创建规则写在一起：

```python
from collections import defaultdict

groups = defaultdict(list)
for name, language in [("Ada", "Python"), ("Lin", "Go"), ("Mei", "Python")]:
    groups[language].append(name)
print(groups["Python"])  # ['Ada', 'Mei']
```

`list` 是工厂函数。首次通过下标访问缺失的键时，它会创建并保存一个新列表，各组不会共用同一个列表。按类别分组、为每个用户收集订单，都属于这种场景。

不过，`groups["unknown"]` 这次“读取”会新增一个键，而 `groups.get("unknown")` 不会触发工厂。用它做纯查询接口时需要意识到这种副作用；结果交给不需要默认行为的代码时，也可以转换成普通 `dict`。

## 队首频繁删除，列表未必合适

列表从末尾取元素很方便，但从开头 `pop(0)` 需要移动后续引用。队列工作集中在两端，`deque` 更贴近这种用法：

```python
from collections import deque

pending = deque(["first", "second"])
pending.append("third")
print(pending.popleft())  # first
print(list(pending))      # ['second', 'third']
```

它适合广度优先遍历、滑动窗口以及进程内简单的先进先出处理。两端增删方便，并不意味着按中间位置查询也像列表一样合适。

`deque(maxlen=3)` 可以只保留最近三项，但满了以后从一端追加，会自动丢弃另一端的旧值。这适合最近事件窗口，不适合“任务绝对不能丢”的业务队列。需要阻塞等待和线程间任务协调时，`queue.Queue` 也有更明确的接口；持久消息处理还涉及进程崩溃后的恢复，不能只靠一个内存容器。

## 迭代工具减少中间结果，统计工具表达计算

`itertools.chain` 能把多个可迭代输入按顺序连起来，不必先复制成一张大列表；`islice` 则可以按范围消费迭代器：

```python
from itertools import chain, islice

combined = chain([1, 2], [3, 4])
print(list(islice(combined, 3)))  # [1, 2, 3]
print(list(combined))            # [4]
```

这次只取前三项，底层迭代器已经前进，剩下的是4。它没有自动保留一份可重放的完整结果，使用条件仍然见[生成器一章](/notes/python-16-iterators-generators)。组合多个输入时，工具可以减少中间存储，却不能消除最终结果的数量；笛卡尔积仍可能非常大。

`statistics` 适合简单描述统计。例如平均值衡量总体水平，中位数则可能更适合描述存在少数极端值的典型样本：

```python
from statistics import mean, median

durations = [10, 11, 12, 1000]
print(mean(durations))    # 258.25
print(median(durations))  # 11.5
```

这不是从两个函数里挑一个“更准确”的答案，而是先确定想描述什么。空输入等无定义情况也要明确处理，不应为了得到一个数随意替换为0。

## 缓存能省计算，也会保留旧结果

`functools.lru_cache` 根据参数缓存函数返回值，适合输入可哈希、重复调用较多、结果允许复用的计算。设置有限的 `maxsize`，可以控制保留的缓存条目数。

如果结果依赖文件当前内容、用户权限或数据库最新状态，仅凭函数参数命中缓存就可能返回过期结果。副作用函数也不适合机械地套缓存，否则该发生的操作可能被省略。先确定缓存何时失效，再考虑节省了多少计算。`partial` 用于预先绑定参数，已在[函数参数](/notes/python-09-functions-advanced)中介绍，它与缓存处理的是不同问题。

## 相似名称不代表相同的数据结构

标准库的 `array.array` 提供紧凑的同类数值存储，不等同于NumPy的多维数组和数组运算系统。需要向量化、多维广播或科学计算生态时，应按问题评估NumPy，不能因为都叫“数组”就认为能力一致。

路径、JSON、CSV、SQLite和子进程也都有标准库入口，前后章节会分别展开。查标准库的出发点应当是“我正在维护什么状态、执行什么操作”，而不是记下一份模块清单。现成工具把语义表达得更清楚时，才真正减少了需要自己维护的代码。

---

[上一篇：装饰器与上下文管理器：把公共动作放在合适的位置](/notes/python-17-decorators-context) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：正则、日期与时间：格式之外还有语义](/notes/python-19-regex-datetime)

