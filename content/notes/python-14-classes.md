---
title: "Python 14：类、属性与数据类：什么时候需要一个对象"
date: "2026-11-12"
excerpt: "我不会因为代码多了就立刻建一个类。几项操作确实共享同一组状态，或者需要一起维护某个规则时，把它们放进对象才有意义；只做转换的逻辑，用函数就够了。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我不会因为代码多了就立刻建一个类。几项操作确实共享同一组状态，或者需要一起维护某个规则时，把它们放进对象才有意义；只做转换的逻辑，用函数就够了。

类把状态和相关行为组合起来。`__init__` 初始化实例；`self` 是当前对象。只有当多个操作共享一组有意义的状态或不变量时才创建类，简单数据转换用函数即可。

```python
from dataclasses import dataclass


@dataclass
class Product:
    name: str
    price: float

    def discounted(self, rate: float) -> float:
        return self.price * (1 - rate)


item = Product("书", 100)
print(item.discounted(0.1))
```

`@dataclass` 可生成常见的初始化和比较方法。`property` 可把受控计算暴露为属性；数据需要持续存储或复杂变更时，应显式定义方法。

## 类属性不等于实例自己的状态

不要把可变类属性当作每个实例各自的状态。实例需要自己的列表时，在实例初始化阶段创建它。

## 动手验证

**练习：**给 `Product` 增加 `is_free` 属性，价格为 0 时返回 `True`。

```python
from dataclasses import dataclass


@dataclass
class Product:
    name: str
    price: float

    @property
    def is_free(self) -> bool:
        return self.price == 0
```

---

[上一篇：模块、导入与程序入口](/notes/python-13-modules-imports) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：组合、继承与协议：依赖需要的行为](/notes/python-15-composition-inheritance)

