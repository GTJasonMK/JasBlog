---
title: "Python 11：文件、路径与编码：先确认读写的对象"
date: "2026-11-12"
excerpt: "文件找不到时，我会先检查当前工作目录，再检查文件名。相对路径跟着进程的工作目录走，和脚本存在哪个目录没有必然关系，这一点比反复改路径字符串更值得先确认。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

文件找不到时，我会先检查当前工作目录，再检查文件名。相对路径跟着进程的工作目录走，和脚本存在哪个目录没有必然关系，这一点比反复改路径字符串更值得先确认。

用 `pathlib.Path` 处理路径，避免手工拼接 `/` 或 `\\`。打开文本文件时显式指定编码；`with` 块结束后自动关闭文件。

```python
from pathlib import Path

path = Path("output") / "notes.txt"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text("你好，Python\n", encoding="utf-8")
text = path.read_text(encoding="utf-8")
print(text.strip())
```

大文件按行读取，避免一次性把全部内容放入内存：

```python
with Path("large.log").open(encoding="utf-8") as file:
    for line in file:
        if "ERROR" in line:
            print(line.rstrip())
```

## 相对路径和覆盖行为都要确认

相对路径相对于当前工作目录，而不一定相对于脚本文件。需要相对于脚本定位资源时，可用 `Path(__file__).parent`。写文件会覆盖目标文件，重要数据应先明确覆盖策略。

## 动手验证

**练习：**统计文件中的行数。

```python
with Path("notes.txt").open(encoding="utf-8") as file:
    line_count = sum(1 for _ in file)
```

---

[上一篇：异常处理：在哪里接住失败](/notes/python-10-exceptions) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：JSON、CSV 与序列化边界](/notes/python-12-data-formats)

