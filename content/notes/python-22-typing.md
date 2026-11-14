---
title: "Python 22：类型标注能检查什么，又不能检查什么"
date: "2026-11-12"
excerpt: "给参数写了 int，运行时传入字符串为什么没有立即报类型错误？从静态检查的用途讲到可空值、TypedDict 和 Protocol，说明标注如何帮助调用者，也解释它无法代替哪些实际校验。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

给函数参数写上 `name: str`，编辑器会提示字符串方法，也能在调用处发现传错类型。可直接运行时，Python通常不会替这个标注插入检查。类型标注主要描述代码希望遵守的约定，静态检查器再沿着程序的类型关系找可能违反约定的位置。

例如：

```python
def greet(name: str) -> str:
    return f"Hello, {name}"

print(greet("Ada"))  # Hello, Ada
```

写 `greet(123)` 通常会被静态检查器指出类型不符，但这份实现用f-string处理123时，运行本身仍然可以得到文本。这就说明“标注不符合”与“这一行立刻触发运行时异常”不是同一个条件。

项目里需要实际运行Mypy、Pyright等检查工具，标注才会成为自动检查的一部分；只有写了标注而从未检查，很多调用错误仍然要等运行才暴露。检查器也有配置和能力范围，不能把一次检查通过视为所有运行行为都正确。

## 可空值必须让调用者看见

一个查询函数可能找不到结果，返回类型就应该表达这种可能性：

```python
def find_name(users: dict[int, str], user_id: int) -> str | None:
    return users.get(user_id)

name = find_name({1: "Ada"}, 2)
if name is None:
    print("用户不存在")
else:
    print(name.upper())
```

判断之后，检查器可以把两个分支中的类型缩小：一个分支是 `None`，另一个分支是字符串。调用者若直接 `name.upper()`，就遗漏了不存在的情况。

`str | None` 表示值可能为空，不等于调用者可以省略这个参数。是否允许省略还取决于函数定义有没有提供默认值。这两个含义混在一起，接口看起来有标注，调用约定仍然不清楚。

## 字典结构也可以成为接口

返回一份统计结果时，单写 `dict` 太宽泛，调用者不知道有哪些字段。`TypedDict` 可以表达字段名及其类型：

```python
from typing import TypedDict


class Summary(TypedDict):
    count: int
    average: float | None


def summarize(scores: list[float]) -> Summary:
    if not scores:
        return {"count": 0, "average": None}
    return {"count": len(scores), "average": sum(scores) / len(scores)}

print(summarize([]))  # {'count': 0, 'average': None}
```

这里把空样本的平均值明确设为 `None`，而不是0。样本数为0与平均值为0有不同含义，类型让后续使用者必须面对这种差别。

`TypedDict` 描述的运行时对象依然是普通字典，不会自动检查字段。它适合字段名固定的请求、响应或内部数据结构；若所有键都遵守同一规则，像 `dict[str, int]` 就已经足够。

函数只是读取并迭代输入时，也可以考虑使用 `Iterable`、`Sequence` 等行为更合适的抽象，避免无端要求调用者必须创建列表。若需要取长度或按下标访问，就应在类型和实现中体现这些要求，不能标成任意可迭代对象后再偷偷依赖列表操作。

`Protocol` 同样从使用方需要的行为出发，例如声明一个对象需要提供 `send(message)`。它适合多个不同实现参与同一流程，细节见[组合与协议](/notes/python-15-composition-inheritance)。

## 标注不会自动校验外部数据

HTTP响应、文件和用户输入来自程序外部，检查器无法仅凭声明知道它们的真实值。把 `json.loads` 的结果赋给一个标为 `Summary` 的变量，并没有执行字段验证。

`typing.cast` 也只是告诉检查器“请按这个类型看”，运行时原对象不会发生变化。错误断言会让后面的代码看起来安全，却在读字段时失败。数据入口仍然需要真实解析与校验，验证后再交给内部具有明确类型的逻辑。

`Any` 表示放宽静态检查，能让一些未知数据更容易通过代码，但也会让错误沿调用链传播而失去提示。不要为了消除报错就给整条业务链标成 `Any`；先确定未知输入的结构，再逐步缩小类型。

最值得先标注的是公共函数、跨模块数据和不容易从赋值看出的复杂返回值。局部的 `count = 0` 通常可以推断，没必要把每一行都变成声明。标注能减少读者需要猜的内容，同时把检查器的能力留在它真正能证明的范围内。

---

[上一篇：虚拟环境与项目结构：让依赖跟着项目走](/notes/python-21-environments-projects) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 pytest 把预期行为留下来](/notes/python-23-testing)

