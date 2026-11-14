---
title: "Python 05：列表、元组和解包该怎么选"
date: "2026-11-12"
excerpt: "一组数据放进什么容器，取决于接下来要怎么用它。需要增删就选列表，固定位置的少量数据可以用元组；只是循环计数时，通常没有必要先造一个列表。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一组数据放进什么容器，取决于接下来要怎么用它。需要增删就选列表，固定位置的少量数据可以用元组；只是循环计数时，通常没有必要先造一个列表。

列表适合保存有顺序、会变化的一组值；元组适合固定结构；`range` 表示整数序列，常用于循环。它们都支持索引、切片和迭代。

```python
scores = [81, 92, 75]
scores.append(88)
first, *middle, last = scores
point = (3, 5)
print(first, middle, last, point[0])

for index, score in enumerate(scores, start=1):
    print(index, score)
```

切片会产生新序列；`list.sort()` 原地排序并返回 `None`，`sorted(list)` 返回新列表。元组自身不可变，但若其中包含列表，该列表仍可变。

## 遍历时只取需要的信息

不要用 `for i in range(len(items))` 做不需要索引的遍历；直接 `for item in items` 更清楚。需要位置时用 `enumerate`。

## 动手验证

**练习：**保留分数不低于 80 的项目。

```python
passed = [score for score in scores if score >= 80]
```

---

[上一篇：字符串：从切片到编码和格式化](/notes/python-04-strings) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：字典与集合：查找、去重和成员判断](/notes/python-06-mappings-sets)

