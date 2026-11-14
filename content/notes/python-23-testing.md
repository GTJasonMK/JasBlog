---
title: "Python 23：用 pytest 把预期行为留下来"
date: "2026-11-12"
excerpt: "代码这次运行成功，怎样确认以后修改也没有破坏原来的约定？从平均值函数的正常和失败情况写起，用 pytest 把行为、边界、临时文件和外部依赖分别放进合适的验证范围。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

计算平均值的函数在 `[2, 4, 6]` 上返回4，不代表它在空列表上也有明确行为。后面有人为了避免除零，把空输入直接改成0，程序依然能运行，业务含义却变了。测试的价值就在于把这些约定保存成可重复执行的检查。

先确定函数应该怎样表现，再写测试。这里约定空输入无平均值，抛出 `ValueError`；其他数值序列返回算术平均值。在同一目录创建实现文件和测试文件：

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


@pytest.mark.parametrize("values, expected", [
    ([2, 4, 6], 4),
    ([7], 7),
    ([-2, 2], 0),
    ([0.1, 0.2], 0.15),
])
def test_average_returns_mean(values, expected):
    assert average(values) == pytest.approx(expected)


def test_average_rejects_empty_input():
    with pytest.raises(ValueError, match="至少需要一个数"):
        average([])
```

没有pytest时，先在当前虚拟环境运行 `python -m pip install pytest`，再执行 `python -m pytest -q`。它会发现符合命名规则的测试文件和函数，执行断言，失败时报告对应输入和结果。

`parametrize` 让同一行为覆盖几组有区别的输入。单元素、正负抵消、小数计算分别检查不同边界，不需要复制四个相同测试函数。小数使用 `pytest.approx` 比较近似值，误差容忍仍应符合计算要求；金额等精确业务不应靠放宽比较来掩盖表示错误。

`pytest.raises` 验证预期失败。若空输入没有报错，或者抛出完全不同的异常，这个测试就不会通过。测试只断言这里需要的异常类型和关键信息，不必把整段调用栈固定下来。

## 边界和失败路径也要验证

测试用例的选择来自接口承诺，而不是看到一行代码就写一条对应断言。若函数承诺保留输入列表，还应该检查调用之后列表没有改变；若从未承诺接受字符串，就先讨论是否需要这个能力，不要为了增加测试数临时发明一套转换行为。

失败路径尤其容易遗漏。例如读取文件失败时必须停止生成报告，可以让读取操作明确失败，再检查没有留下假成功输出。只断言函数执行过某一行，通常无法证明这条业务要求。

修改实现以后测试失败，也不代表测试一定正确。如果需求已经改变，应先核对新要求，再更新实现和测试；若要求没变，就不能简单把预期值改成当前输出来消除红色提示。

## 文件和外部服务需要独立的测试环境

测试文件操作时，不能依赖自己桌面上刚好存在的 `input.csv`。pytest的 `tmp_path` 为每个测试提供独立的临时目录：

```python
def test_utf8_file_round_trip(tmp_path):
    path = tmp_path / "notes.txt"
    path.write_text("你好，Python\n", encoding="utf-8")
    assert path.read_text(encoding="utf-8") == "你好，Python\n"
```

这段展示fixture的使用。真实项目应当调用自己的读写函数，并检查它承诺的输出、覆盖行为和失败处理；没有必要给标准库每个API重写一份同样的测试。

邮件、时钟和HTTP接口等依赖，可以通过参数传入替身或测试客户端，让当前测试得到确定的输入。需要检查“请求确实正确发送到服务”时，再增加相应集成测试。替身返回一次成功，无法证明真实网络、认证和服务器配置也正确。

测试顺序也不应成为隐藏条件。单独执行任何一个测试都应成立，不能依赖上一个测试留下变量、文件或数据库记录。共享fixture可以减少准备工作，但它的生命周期和清理责任要明确。

## 分层验证，是在回答不同的问题

单元测试适合确定计算和分支规则；集成测试检查模块与真实依赖是否接得上；端到端测试则从使用者入口走过完整路径。三者的成本和能证明的事情不同，不能拿一百个纯函数测试代替一次安装和启动检查。

这里的平均值测试不需要数据库或浏览器，几组输入就能验证其主要约定。若未来把它用在报告生成流程中，再针对读取、计算、输出之间的衔接补检查。让每个测试有一个会因真实错误而失败的理由，测试数量才有意义。

---

[上一篇：类型标注能检查什么，又不能检查什么](/notes/python-22-typing) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：调试、日志与配置：留下能解释问题的信息](/notes/python-24-debugging-logging)

