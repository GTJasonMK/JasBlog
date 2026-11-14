---
title: "Python 16：迭代器与生成器：数据不必一次准备好"
date: "2026-11-12"
excerpt: "处理日志这类逐条消费的数据时，我通常不需要先把所有结果装进列表。生成器可以处理到哪里就产生到哪里，不过它已经走过的部分不会自动重来。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

处理日志这类逐条消费的数据时，我通常不需要先把所有结果装进列表。生成器可以处理到哪里就产生到哪里，不过它已经走过的部分不会自动重来。

可迭代对象能被 `for` 遍历；迭代器逐个产生值；生成器函数用 `yield` 延迟生成结果，适合数据量大或逐步计算的场景。

```python
def squares(limit):
    for number in range(limit):
        yield number * number


for value in squares(4):
    print(value)
```

生成器只消费一次；若要重复遍历，可重新调用生成器函数。`next(iterator)` 取下一个值，耗尽时抛 `StopIteration`，通常由 `for` 自动处理。

## 生成器耗尽后不会自动重放

把生成器存起来后，不要假设它仍能从开头重放。需要多次访问时，先判断数据规模，再决定是否转为列表。

## 动手验证

**练习：**写生成器，依次输出文本中非空行的去空白版本。

```python
def cleaned_lines(lines):
    for line in lines:
        line = line.strip()
        if line:
            yield line
```

---

[上一篇：组合、继承与协议：依赖需要的行为](/notes/python-15-composition-inheritance) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：装饰器与上下文管理器：把公共动作放在合适的位置](/notes/python-17-decorators-context)

