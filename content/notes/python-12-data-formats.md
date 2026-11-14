---
title: "Python 12：JSON、CSV 与序列化边界"
date: "2026-11-12"
excerpt: "能把文本解析出来，只说明它符合 JSON 或 CSV 的格式；字段是否齐全、数量是否有效，还需要另外检查。我会把解析和业务校验当作两个步骤。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

能把文本解析出来，只说明它符合 JSON 或 CSV 的格式；字段是否齐全、数量是否有效，还需要另外检查。我会把解析和业务校验当作两个步骤。

JSON 适合表达 API 和配置中的对象、数组、字符串、数字、布尔值和空值；CSV 适合表格记录。两者都应在输入边界检查字段和类型。

```python
import json

record = {"name": "Ada", "active": True}
text = json.dumps(record, ensure_ascii=False)
restored = json.loads(text)
print(restored["name"])
```

```python
import csv

with open("people.csv", newline="", encoding="utf-8") as file:
    for row in csv.DictReader(file):
        print(row["name"])
```

## 格式能解析，不代表数据可信

JSON 对象的键是字符串；Python 的 `None`、`True`、`False` 会分别映射为 JSON 的 `null`、`true`、`false`。不要对不可信数据使用 `pickle`：反序列化可能执行任意代码。

## 动手验证

**练习：**把 `record` 写入 `record.json`。

```python
with open("record.json", "w", encoding="utf-8") as file:
    json.dump(record, file, ensure_ascii=False, indent=2)
```

---

[上一篇：文件、路径与编码：先确认读写的对象](/notes/python-11-files-paths) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：模块、导入与程序入口](/notes/python-13-modules-imports)

