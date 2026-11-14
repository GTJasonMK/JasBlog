---
title: "Python 14：类、属性与数据类：什么时候需要一个对象"
date: "2026-11-12"
excerpt: "商品的名称和价格可以放进字典，为什么还要定义类？从一份需要维持有效价格的商品数据开始，理解实例、方法、类属性和数据类，再判断哪些规则值得放进对象。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一条商品数据可以先写成 `{"name": "书", "price_cents": 10000}`。只有两项信息时，这样已经很好理解。等到每个地方都要检查价格不能为负、计算折后价格、判断是否免费，字段和围绕字段的规则才开始需要一个明确的归属。

类可以把这些状态和行为放在一起。类描述一类对象可以具有哪些属性和操作，实例则是其中某个具体对象。先不用自动生成工具，看看实例怎样获得自己的状态：

```python
class Product:
    def __init__(self, name, price_cents):
        if type(price_cents) is not int or price_cents < 0:
            raise ValueError("价格必须是非负整数分")
        self.name = name
        self.price_cents = price_cents

    @property
    def is_free(self):
        return self.price_cents == 0

item = Product("书", 10000)
print(item.name, item.is_free)  # 书 False
```

调用 `Product(...)` 创建实例后，`__init__` 负责初始化它。`self` 是当前实例，`self.name` 让这个实例持有自己的名称。再创建另一个 `Product`，两份价格和名称互不替代。

这里用整数分保存价格，避免把金额的舍入问题悄悄混进类的入门示例。`property` 把一个计算暴露为属性，读取 `item.is_free` 时会执行对应逻辑，调用处不用括号。它适合这种轻量、无副作用、由已有状态推得的值；数据库查询和付款等明显有代价的操作，应当用明确的方法表达。

## 初始化检查不等于永远有效

上面的 `__init__` 只检查创建时传入的价格，随后直接执行 `item.price_cents = -1` 仍然可能破坏约定。对象不会因为定义了类就自动获得访问控制。

如果价格需要经常修改，可以让改价方法执行校验，并在调用约定中要求所有修改经过它。若希望内部状态不被普通赋值随意替换，也可以使用只读属性等方式控制接口。Python的单下划线主要表达“内部使用”的约定，不是权限隔离；安全规则也不能只靠字段命名维持。

这一点影响是否值得建类。只是收到数据后立刻转成另一份数据，函数和字典可能更简洁；多次操作需要共享有效状态时，对象才有助于把规则集中维护。类增加了一个需要理解的接口，应当让调用者少记住几条隐含规则。

## 类属性不等于实例自己的状态

把列表直接写在类体里，会让实例共享那一个列表：

```python
class SharedCart:
    items = []

first = SharedCart()
second = SharedCart()
first.items.append("书")
print(second.items)  # ['书']
```

`first` 本身没有 `items` 属性，读取时找到了类上的属性；对这个列表调用 `append`，修改的还是类持有的同一个对象。每个购物车都应有自己的列表，就应在 `__init__` 中写 `self.items = []`。

类属性适合所有实例共用的常量或有意共享的状态；实例属性适合对象自己的数据。它们在读取时看起来都可以写 `obj.name`，却不代表归属相同。

## 数据类省掉重复定义，不替你验证业务

当一个类型主要承载数据时，手写初始化、可读输出和比较方法很重复。`dataclass` 可以按声明的字段生成这些常见方法：

```python
from dataclasses import dataclass, field


@dataclass
class Product:
    name: str
    price_cents: int
    tags: list[str] = field(default_factory=list)

    def __post_init__(self):
        if type(self.price_cents) is not int or self.price_cents < 0:
            raise ValueError("价格必须是非负整数分")

    @property
    def is_free(self) -> bool:
        return self.price_cents == 0

book = Product("书", 10000)
gift = Product("赠品", 0)
book.tags.append("阅读")
print(gift.tags, gift.is_free)  # [] True
```

`default_factory=list` 会在需要默认值时为每个实例创建列表，避免共用可变默认值。`__post_init__` 在生成的初始化方法完成字段赋值后执行，适合集中校验这些字段的组合。

字段上的 `int`、`list[str]` 是类型标注，帮助工具检查代码，不会让运行时自动拒绝错误类型。上面价格检查仍然需要自己写。若希望对象创建以后不再普通赋值，可以考虑 `frozen=True`，但它也不会递归冻结内部列表。

在这份数据上增加折扣方法时，还得规定折扣范围、返回整数分还是十进制金额，以及不足一分如何舍入。类只给了规则一个集中放置的地方，业务含义仍要明确。拿到一个“有方法的对象”，不等于所有使用条件都已经解决。

---

[上一篇：模块、导入与程序入口](/notes/python-13-modules-imports) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：组合、继承与协议：依赖需要的行为](/notes/python-15-composition-inheritance)

