---
title: "Python 19：正则、日期与时间：格式之外还有语义"
date: "2026-11-12"
excerpt: "日期长得像 2026-02-30，不代表日历上有这一天。通过编号提取、日期解析和时区转换，区分文本格式与实际含义，并说明正则、date、datetime 和持续时间分别用在什么地方。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

从一句话里找订单编号，与判断一个日期是否合法，是不同的问题。前者主要寻找文字模式，后者还要理解月份、闰年和天数。它们都表现为字符串，并不意味着都适合交给同一个正则表达式处理。

先从格式确实固定的订单号开始：

```python
import re

text = "订单号：AB-1234"
match = re.search(r"订单号：([A-Z]{2}-[0-9]{4})", text)
if match:
    print(match.group(1))
```

`search` 在整段文本里寻找匹配片段，括号保存要提取的编号，`group(1)` 取出第一组。这里得到 `AB-1234`。`r"..."` 表示原始字符串，减少Python字符串层对反斜杠的处理，正则自己的规则仍然存在。

`[A-Z]{2}` 表示两个大写英文字母，`[0-9]{4}` 表示四个ASCII数字。Python默认的 `\d` 能匹配更多Unicode数字，若接口规定编号只能使用0到9，明确写出字符范围更符合合同。

若要求整份输入都是一个编号，使用 `fullmatch`，而不是只看里面是否包含一个合法片段。`findall` 适合取出多处匹配。查找一个固定前缀、拆一个已知分隔符，字符串方法往往已经足够；正则适合重复的字符结构，不必拿它代替完整语言或文件格式的解析器。

## 模式符合以后，才轮到含义检查

`2026-02-30` 符合“年份、连字符、月份、连字符、日期”的外观，但那一年2月没有30日。日期类型能验证这一层：

```python
from datetime import date

print(date.fromisoformat("2024-02-29"))  # 2024-02-29
try:
    date.fromisoformat("2026-02-30")
except ValueError:
    print("不是有效的日历日期")
```

`date` 适合生日、账单所属日期这类只有“哪一天”而没有具体时刻的概念。是否接受其他表示法，以及输入是否必须严格满足 `YYYY-MM-DD`，还应按接口合同检查；格式约束和日历约束可以各自承担一部分职责。

复杂正则对读者和匹配引擎都有成本。对长而不受控的外部文本使用嵌套重复模式，可能产生很大的回溯开销。固定结构尽量写得明确，输入长度也应限制，别把一个字符串的解析变成无上限的计算。

## 同一个时间点，可以有不同的墙上时间

记录一次发布、付款或登录事件，需要知道它具体发生在哪个时刻。只写 `2026-11-14 09:00`，没有时区，两个地区的读者会得到不同理解。

带时区的 `datetime` 可以表达这一点：

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

instant = datetime(2026, 11, 14, 1, 0, tzinfo=timezone.utc)
local = instant.astimezone(ZoneInfo("Asia/Shanghai"))
print(instant.isoformat())  # 2026-11-14T01:00:00+00:00
print(local.isoformat())    # 2026-11-14T09:00:00+08:00
print(instant == local)     # True
```

这两份表示指向同一个时间点，只是展示时区不同。`datetime.now(timezone.utc)` 可以取得当前UTC时间。跨系统记录常统一保存UTC或带偏移的时间，显示时再转换到用户需要的时区。

`ZoneInfo` 使用时区数据库，在某些环境里需要另外安装 `tzdata` 数据包。固定偏移只说明与UTC相差多少，地区时区还包含历史规则和夏令时变化。已经发生的某次事件，与“每周一当地9点开会”这类未来日程，也需要不同的数据模型。

无时区的 `datetime` 称为naive时间，它可以表示“当地钟表显示了什么”，却没有足够信息确定全球的唯一时刻。`replace(tzinfo=...)` 是附加或替换解释信息，不会像 `astimezone` 那样转换钟面数值；不知道原时区时直接替换，会把事件放到错误的位置。

## 持续多久，不一定要看当前日期时间

两个时间点的差可以用 `timedelta` 表达，取总秒数使用 `total_seconds()`。只看 `.seconds` 会忽略天数部分，对长时间间隔可能得到误导结果。

测量函数运行了多久，使用 `time.perf_counter()` 这样的单调时钟更合适。系统日期时间可能被校准，它适合标记事件发生时刻，不适合直接承诺超时等待永远不受调整影响。两个时钟各自回答一个问题：“几点发生”和“经过多久”。

最后再看编号提取的一个边界：

```python
codes = re.findall(r"\b[0-9]{4}\b", "编号 1234 和 56789")
print(codes)  # ['1234']
```

如果输入变为 `id1234`，单词边界规则又会影响匹配；它并不等同于“数字左右不能再有数字”。真正需要的前后边界要从编号规则确定，再用普通样本、长编号、混合字符分别验证。

---

[上一篇：常用标准库：先看操作，再选工具](/notes/python-18-standard-library) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：命令行、子进程和 HTTP：处理外部输入](/notes/python-20-cli-http)

