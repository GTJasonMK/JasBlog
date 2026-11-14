---
title: "Python 07：条件、循环与推导式：把处理过程写清楚"
date: "2026-11-12"
excerpt: "推导式能把一段过滤或转换写得很短，但短不一定好读。我通常先用普通循环把处理顺序写清楚，确认只是简单映射或筛选后，再考虑改成推导式。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

推导式能把一段过滤或转换写得很短，但短不一定好读。我通常先用普通循环把处理顺序写清楚，确认只是简单映射或筛选后，再考虑改成推导式。

`if/elif/else` 表达分支，`for` 遍历可迭代对象，`while` 在条件为真时重复。`break` 结束循环，`continue` 跳过本轮。优先让循环直接表达业务意图。

```python
values = [3, 8, 11, 14]
for value in values:
    if value % 2:
        continue
    print(value)

names = ["Ada", "Linus", "Grace"]
long_names = [name for name in names if len(name) > 3]
```

循环的 `else` 在循环没有被 `break` 中断时执行，常用于“搜索后未找到”；若读者不熟悉该语义，普通标志变量往往更直观。推导式适合短小映射或过滤，不适合塞入多层复杂逻辑。

## 不要一边遍历一边删原列表

`for` 遍历列表时直接删除当前元素，可能跳过后续元素；先用列表推导式构造结果，或遍历副本。

## 动手验证

**练习：**找到第一个大于 10 的数；若没有，打印提示。

```python
for value in values:
    if value > 10:
        print(value)
        break
else:
    print("未找到")
```

---

[上一篇：字典与集合：查找、去重和成员判断](/notes/python-06-mappings-sets) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：函数、返回值与作用域](/notes/python-08-functions)

