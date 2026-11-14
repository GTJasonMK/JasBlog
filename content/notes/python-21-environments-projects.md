---
title: "Python 21：虚拟环境与项目结构：让依赖跟着项目走"
date: "2026-11-12"
excerpt: "遇到“明明装了包却导入失败”，我会先核对运行程序和安装依赖用的是不是同一个解释器。虚拟环境就是为了让这件事和每个项目绑定，而不是依赖机器当前碰巧装了什么。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

遇到“明明装了包却导入失败”，我会先核对运行程序和安装依赖用的是不是同一个解释器。虚拟环境就是为了让这件事和每个项目绑定，而不是依赖机器当前碰巧装了什么。

虚拟环境隔离每个项目的第三方依赖，避免两个项目互相升级或破坏包版本。`venv` 属于标准库；`pip` 是单独维护的包安装工具，常随 Python 安装或由 `ensurepip` 引导安装。现代项目还会用 `pyproject.toml` 记录项目配置。

```console
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell
.venv\Scripts\Activate.ps1
python -m pip install httpx
```

常见结构：

```text
my_project/
├── pyproject.toml
├── src/my_project/
├── tests/
└── README.md
```

## 安装和运行要使用同一个解释器

不要把虚拟环境目录提交到 Git。安装依赖时用 `python -m pip`，确保 pip 对应当前解释器。重现项目时记录 Python 与依赖版本。

## 动手验证

**练习：**项目显示 `ModuleNotFoundError`，先检查什么？

**答案：**检查运行程序的解释器是否就是安装依赖时使用的解释器，并确认虚拟环境已激活。

---

[上一篇：命令行、子进程和 HTTP：处理外部输入](/notes/python-20-cli-http) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：类型标注能检查什么，又不能检查什么](/notes/python-22-typing)

