---
title: "Python 23：用 pytest 把预期行为留下来"
date: "2026-11-12"
excerpt: "一个测试对我有没有用，主要看它能不能说清楚：什么输入，在什么条件下，应该得到什么结果。空输入和失败路径尤其值得写下来，免得以后改代码时只记得正常情况。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个测试对我有没有用，主要看它能不能说清楚：什么输入，在什么条件下，应该得到什么结果。空输入和失败路径尤其值得写下来，免得以后改代码时只记得正常情况。

测试把预期行为写成可重复执行的检查。优先测试可观察的结果与边界行为；纯函数容易测试，外部服务、时间和文件系统可通过依赖注入或临时目录隔离。

建立两个文件：

```python
# math_utils.py
def average(values):
    if not values:
        raise ValueError("至少需要一个数")
    return sum(values) / len(values)
```

```python
# test_math_utils.py
import pytest
from math_utils import average


def test_average_returns_mean():
    assert average([2, 4, 6]) == 4


def test_average_rejects_empty_input():
    with pytest.raises(ValueError, match="至少需要一个数"):
        average([])
```

运行 `python -m pytest`。常见测试层次是单元测试、模块集成测试和端到端测试；不是所有实现细节都值得测试。

## 边界和失败路径也要验证

测试不能只覆盖“正常输入”。还要检查空集合、缺失字段、边界值和失败路径。测试应能独立运行，不依赖上一次测试留下的状态。

## 动手验证

**练习：**补充一个只传入单个数值的测试。

```python
import pytest
from math_utils import average

def test_average_single_value():
    assert average([7]) == 7
```

---

[上一篇：类型标注能检查什么，又不能检查什么](/notes/python-22-typing) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：调试、日志与配置：留下能解释问题的信息](/notes/python-24-debugging-logging)

