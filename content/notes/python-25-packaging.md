---
title: "Python 25：用 pyproject.toml 把项目变成可安装的包"
date: "2026-11-12"
excerpt: "从源码目录运行成功，还不能说明别人安装后也能用。我会把包发现规则、最低 Python 版本和依赖写进配置，再到干净环境里确认安装后的入口和导入是否正常。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

从源码目录运行成功，还不能说明别人安装后也能用。我会把包发现规则、最低 Python 版本和依赖写进配置，再到干净环境里确认安装后的入口和导入是否正常。

可安装项目需要明确名称、版本、依赖和包内容。`pyproject.toml` 是现代 Python 项目的标准配置入口；实际发布时应查看目标构建工具和 PyPI 的最新说明。

与[第 21 章](/notes/python-21-environments-projects)的 `src/my_project/` 目录结构配套的最小可安装配置：

```toml
[build-system]
requires = ["setuptools>=64"]
build-backend = "setuptools.build_meta"

[project]
name = "example-tools"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = []

[tool.setuptools.packages.find]
where = ["src"]
```

本地开发时可编辑安装，使代码修改无需重复复制：

```console
python -m pip install -e .
```

## 源码运行和安装包运行要分别检查

导入包名和发行包名可能不同。`[build-system]` 声明构建后端及构建依赖；`where = ["src"]` 让 setuptools 在 `src/` 中发现包。不要假设从源码目录运行成功就代表安装包正确；从干净环境安装并运行才是更可靠的交付检查。

## 动手验证

**练习：**为什么项目要声明最低 Python 版本？

**答案：**使用者和工具能提前判断解释器是否兼容，避免运行到新语法或 API 时才失败。

---

[上一篇：调试、日志与配置：留下能解释问题的信息](/notes/python-24-debugging-logging) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：Git、依赖与安全：守住几条输入边界](/notes/python-26-git-security)

