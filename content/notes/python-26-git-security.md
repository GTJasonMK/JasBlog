---
title: "Python 26：Git、依赖与安全：守住几条输入边界"
date: "2026-11-12"
excerpt: "安全检查可以从很具体的地方开始：SQL 有没有绑定参数，路径能不能走出允许目录，凭证会不会被提交或打印。这些规则应该跟着实际输入边界走。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

安全检查可以从很具体的地方开始：SQL 有没有绑定参数，路径能不能走出允许目录，凭证会不会被提交或打印。这些规则应该跟着实际输入边界走。

Git 记录源码变化，适合保存代码、文档和配置模板；生成文件、虚拟环境和密钥不应提交。每次提交聚焦一个可解释的变化。

安全重点从输入边界开始：校验格式和范围；参数化数据库查询；限制路径访问；不执行不可信反序列化数据；保护凭证；保持依赖更新。

```python
# SQLite 参数化查询，避免拼接 SQL
cursor.execute("SELECT name FROM users WHERE id = ?", (user_id,))
```

## 删掉工作区文件不等于撤销已泄露的密钥

删除工作区中的密钥不一定能从 Git 历史消除；如果密钥曾提交，应立即撤销并轮换。对 shell、SQL、文件路径、HTML 等不同边界使用各自适当的安全处理。

## 动手验证

**练习：**下面写法有什么问题？`query = "SELECT * FROM users WHERE name='" + name + "'"`

**答案：**用户输入被拼进 SQL，可能造成注入；改用参数化查询。

---

[上一篇：用 pyproject.toml 把项目变成可安装的包](/notes/python-25-packaging) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：浅拷贝与深拷贝：到底复制到了哪一层](/notes/python-27-references-copy)

