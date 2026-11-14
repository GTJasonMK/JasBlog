---
title: "Python 06：字典与集合：查找、去重和成员判断"
date: "2026-11-12"
excerpt: "如果问题是“这个名字对应什么”，我会先想到字典；如果问题是“有没有、是否重复”，集合往往更合适。选对结构，比在列表上多写几个循环更直接。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

如果问题是“这个名字对应什么”，我会先想到字典；如果问题是“有没有、是否重复”，集合往往更合适。选对结构，比在列表上多写几个循环更直接。

字典把键映射到值，适合按名称查找；集合保存不重复元素，适合去重和成员测试。字典保留插入顺序，但业务逻辑不应依赖偶然的构造细节。

```python
user = {"name": "Ada", "active": True}
user["score"] = 96
nickname = user.get("nickname", "未设置")

unique_tags = set(["python", "data", "python"])
print("data" in unique_tags)  # True
```

常见字典方法有 `get`、`items`、`keys`、`values`、`setdefault`。集合支持并集 `|`、交集 `&`、差集 `-`。字典键和集合元素必须可哈希；列表不能作为键，元组只有在其成员都可哈希时才能作为键。

## 不存在的键和空值要分开

`d[key]` 在键不存在时抛 `KeyError`；`d.get(key)` 返回 `None`，但值本身可能也为 `None`，因此有时应使用 `if key in d` 明确区分。

## 动手验证

**练习：**求两个标签列表共同拥有的标签。

```python
common = set(["python", "web"]) & set(["data", "python"])
print(common)  # {'python'}
```

---

[上一篇：列表、元组和解包该怎么选](/notes/python-05-sequences) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：条件、循环与推导式：把处理过程写清楚](/notes/python-07-control-flow)

