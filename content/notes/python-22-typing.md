---
title: "Python 22：类型标注能检查什么，又不能检查什么"
date: "2026-11-12"
excerpt: "我把类型标注看作写给编辑器、检查器和调用者的接口说明。它能提前发现一部分误用，但不会替代码检查文件或 HTTP 请求里真正传进来的值。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我把类型标注看作写给编辑器、检查器和调用者的接口说明。它能提前发现一部分误用，但不会替代码检查文件或 HTTP 请求里真正传进来的值。

类型标注帮助编辑器、静态检查器和读者理解接口，但 Python 运行时通常不会自动强制检查标注。对外部输入仍需真实校验。

```python
from typing import TypedDict


class Summary(TypedDict):
    count: int
    average: float


def summarize(scores: list[float]) -> Summary:
    if not scores:
        return {"count": 0, "average": 0.0}
    return {"count": len(scores), "average": sum(scores) / len(scores)}
```

可用 `str | None` 表示可能为空的值，`TypedDict` 描述字典字段，`Protocol` 描述行为接口。类型标注应逐步加在公共函数和复杂数据边界上，不必给每个局部变量都写类型。

## 标注不会自动校验外部数据

标注 `age: int` 不会阻止用户传入 `"未知"`。API、文件和数据库数据需要独立的运行时验证。

## 动手验证

**练习：**给一个接收名称并返回问候语的函数加标注。

```python
def greet(name: str) -> str:
    return f"Hello, {name}"
```

---

[上一篇：虚拟环境与项目结构：让依赖跟着项目走](/notes/python-21-environments-projects) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 pytest 把预期行为留下来](/notes/python-23-testing)

