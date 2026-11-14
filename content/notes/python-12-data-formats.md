---
title: "Python 12：JSON、CSV 与序列化边界"
date: "2026-11-12"
excerpt: "接口传来的 JSON 能解析，为什么程序还是会在取字段时出错？从 Python 对象与交换格式的区别开始，说明 JSON、CSV 怎样保存数据、在哪里校验，以及哪些内容无法无损往返。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Python 字典可以在当前程序里使用，但另一个进程、浏览器或磁盘文件并不直接理解这个对象。要把信息交出去，需要一种双方约定的表示方式。序列化把对象转换为可保存、可传输的表示；反序列化再从表示恢复数据。

JSON 经常出现在接口和配置中，因为它能表达嵌套对象、数组和基本值。先做一次往返：

```python
import json

record = {"name": "Ada", "active": True}
text = json.dumps(record, ensure_ascii=False)
restored = json.loads(text)
print(restored["name"])
```

`dumps` 返回字符串，`loads` 从字符串等受支持输入解析出对象。去掉结尾的 `s`，`dump` 和 `load` 则面向文件对象。`ensure_ascii=False` 使中文以可读文字保留，不会改变数据含义；写成文件时仍需明确文本编码。

比如把同一条记录保存到文件再读回：

```python
with open("record.json", "w", encoding="utf-8") as file:
    json.dump(record, file, ensure_ascii=False, indent=2, allow_nan=False)

with open("record.json", encoding="utf-8") as file:
    loaded = json.load(file)
print(loaded == record)  # True
```

这里使用 `w`，因此这个示例文件已存在时会被覆盖。JSON适合保存一份结构化文档，一次写入一个完整对象；不断向同一文件追加多个 `json.dump` 结果，并不会自动组成合法JSON数组。逐条记录的日志可以另行约定JSON Lines，每行一个完整JSON值。

## 格式相同，不保证还原成原来的Python类型

JSON中的 `null`、`true`、`false` 分别对应 Python 的 `None`、`True`、`False`。JSON对象的成员名是字符串，数组则解析为列表，所以用整数作字典键、用元组保存结构，再经过序列化和解析，未必还能保持原对象类型。

日期、`Decimal` 和自定义类也不属于JSON内置数据类型，需要显式约定表示。例如金额可以用分为单位的整数，时间可以使用带时区的ISO字符串。接收方按同一个合同解释，才能恢复正确含义。只把对象转换成 `str` 虽然能输出，通常已经丢失了可机器检查的结构。

数值还受接收方语言的限制。Python能保存很大的整数，不意味着浏览器JavaScript的 `number` 能精确保存它；大ID是否传字符串，应在接口合同中确定。标准JSON也没有 `NaN` 和无穷大，写出时设置 `allow_nan=False` 可以拒绝这些值，避免产生接收方不支持的文档。

## 格式能解析，不代表字段已经可用

`json.loads("[]")` 完全成功，接下来却不能按用户字典读取 `data["name"]`。因此反序列化后还要检查业务需要的结构：

```python
def read_person(text):
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("用户信息必须是对象")
    name = data.get("name")
    age = data.get("age")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("姓名不能为空")
    if type(age) is not int or age < 0:
        raise ValueError("年龄必须是非负整数")
    return {"name": name.strip(), "age": age}

print(read_person('{"name": " Ada ", "age": 18}'))
```

这里对年龄使用 `type(age) is int`，因为Python的布尔类型是整数的子类，`isinstance(True, int)` 为真，而这个字段不接受布尔值。姓名清理和数值范围也属于业务规则，JSON解析器不会替你检查。

无效JSON本身会引发 `json.JSONDecodeError`，结构不符合本函数要求则由明确的校验拒绝。成熟项目可以用专门的schema工具集中声明合同，但边界上的“先解析，再确认可用”仍然需要存在。

## 表格交换为什么要用CSV解析器

CSV更适合一行一条、列结构相对固定的数据，例如从电子表格导出用户清单。它容易查看，却没有通用的强类型系统。一个值写成 `"18"`，读取时一般仍是文本，年龄转换需要另做。

创建一份包含逗号的姓名字段，就能看出 `split(",")` 的问题：

```python
import csv

with open("people.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["name", "age"])
    writer.writeheader()
    writer.writerow({"name": "Lin, Mei", "age": 18})

with open("people.csv", newline="", encoding="utf-8") as file:
    for row in csv.DictReader(file):
        print(row["name"], int(row["age"]))  # Lin, Mei 18
```

写入器负责必要的引号与转义，读取器再按CSV规则恢复字段，姓名里的逗号不会多拆出一列。`newline=""` 让CSV模块处理换行，避免与文本层的换行转换互相影响。真实导入还要核对列名、缺失字段和多余列，不能只看第一行成功就假定整个文件正确。

JSON与CSV的选择最终取决于数据关系。嵌套的订单和订单项适合JSON，一张平铺的月度表格适合CSV。它们都用于表达数据；`pickle` 则能恢复更多Python对象，但反序列化可能执行代码，不应对来自用户、网络或其他不可信来源的内容使用它。

解析器也需要资源边界。一个格式合法但体积巨大的文档，仍可能占满内存。文件大小、记录数量和请求超时，应当与格式及字段校验一起纳入输入处理。

---

[上一篇：文件、路径与编码：先确认读写的对象](/notes/python-11-files-paths) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：模块、导入与程序入口](/notes/python-13-modules-imports)

