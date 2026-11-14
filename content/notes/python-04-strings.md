---
title: "Python 04：字符串：从切片到编码和格式化"
date: "2026-11-12"
excerpt: "处理文本时，我会把字符串和字节分开看：页面上读到的是文字，文件和网络传输的则是按编码组织的字节。很多乱码问题，其实就出在这条边界上。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

处理文本时，我会把字符串和字节分开看：页面上读到的是文字，文件和网络传输的则是按编码组织的字节。很多乱码问题，其实就出在这条边界上。

字符串 `str` 是不可变的 Unicode 文本序列。索引从 `0` 开始，负数从末尾计数；切片采用左闭右开区间。文本与字节不同：文本用 `str`，文件或网络上的原始字节用 `bytes`。

```python
text = "Python 教程"
print(text[0])       # P
print(text[-2:])     # 教程
name, score = "Ada", 96
print(f"{name} 得分 {score:.1f}")
```

拼接少量文本可用 `+`；循环构造大量文本时，先收集片段再 `"".join(parts)`。读取文件时显式指定 `encoding="utf-8"`，避免依赖机器默认编码。

## 修改字符串会产生新值

字符串不能原地修改：`text[0] = "p"` 会报错。需要用切片或替换产生新字符串。

## 动手验证

**练习：**把 `"  hello python  "` 清理空格并改成标题形式。

```python
cleaned = "  hello python  ".strip().title()
print(cleaned)  # Hello Python
```

---

[上一篇：数字、真假值与类型转换](/notes/python-03-basic-types) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：列表、元组和解包该怎么选](/notes/python-05-sequences)

