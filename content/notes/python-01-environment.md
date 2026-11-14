---
title: "Python 01：先把解释器和运行方式弄清楚"
date: "2026-11-12"
excerpt: "开始写 Python 之前，我会先确认一件事：眼前这一行到底是在终端里执行，还是交给 Python 解释器执行。把这两层分开，环境问题就容易判断得多。"
tags: [ "Python", "语言基础" ]
category: "python-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

开始写 Python 之前，我会先确认一件事：眼前这一行到底是在终端里执行，还是交给 Python 解释器执行。把这两层分开，环境问题就容易判断得多。

终端负责启动程序；Python 解释器读取并执行 Python 代码。交互模式适合快速试验，脚本适合重复运行，Notebook 适合边写边看数据和图表。Windows 常用 `py` 启动器；macOS/Linux 常用 `python3`。具体命令取决于安装方式。

```console
python --version
python hello.py
```

```python
# hello.py
name = "Python"
print(f"Hello, {name}!")
```

## 命令和代码要放对地方

`python hello.py` 是终端命令，不能直接写在普通 `.py` 文件里。若系统里有多个 Python，安装依赖和运行程序必须使用同一个解释器。

## 动手验证

**练习：**写一个脚本，打印你的名字和 Python 版本。

```python
import sys

print("我是小林")
print(sys.version)
```

---

[Python 目录](/notes/python-00-learning-guide) · [下一篇：变量、对象与赋值：改的是名字，还是对象](/notes/python-02-objects)

