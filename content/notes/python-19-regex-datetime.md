---
title: "Python 19：正则、日期与时间：格式之外还有语义"
date: "2026-11-12"
excerpt: "提取一个固定格式的编号，可以用正则；表示一次真正发生的事件，还得考虑时区。我的判断是：先确定数据想表达什么，再选字符串方法、正则或时间类型。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

提取一个固定格式的编号，可以用正则；表示一次真正发生的事件，还得考虑时区。我的判断是：先确定数据想表达什么，再选字符串方法、正则或时间类型。

普通字符串方法足以处理简单文本；当模式重复或结构明确时，使用 `re`。正则表达式前缀 `r` 可减少反斜杠转义。

```python
import re

text = "订单号：AB-1234"
match = re.search(r"订单号：([A-Z]{2}-\d{4})", text)
if match:
    print(match.group(1))
```

日期用 `datetime.date`，时间点用带时区的 `datetime`。跨时区系统优先存 UTC，再按用户时区展示。输入格式不固定时，解析失败应作为显式错误处理。

```python
from datetime import datetime, timezone

now = datetime.now(timezone.utc)
print(now.isoformat())
```

## 跨系统时间要带时区

不要用无时区时间表示跨系统的真实时间点。复杂正则不易维护，能用分隔、解析器或明确字段规则时优先选择简单方法。

## 动手验证

**练习：**匹配一个简单的 4 位数字编号。

```python
codes = re.findall(r"\b\d{4}\b", "编号 1234 和 56789")
print(codes)  # ['1234']
```

---

[上一篇：常用标准库：先看操作，再选工具](/notes/python-18-standard-library) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：命令行、子进程和 HTTP：处理外部输入](/notes/python-20-cli-http)

