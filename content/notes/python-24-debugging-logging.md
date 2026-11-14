---
title: "Python 24：调试、日志与配置：留下能解释问题的信息"
date: "2026-11-12"
excerpt: "调试时，我会先找到数据从哪一步开始不符合预期，再决定往哪里加日志。比起到处打印“执行到了这里”，输入范围、处理数量和异常堆栈更能解释发生了什么。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

调试时，我会先找到数据从哪一步开始不符合预期，再决定往哪里加日志。比起到处打印“执行到了这里”，输入范围、处理数量和异常堆栈更能解释发生了什么。

调试从复现问题开始：缩小输入、检查变量、定位第一个错误状态。短脚本可用 `breakpoint()`；长期运行的程序要用日志记录事件和错误上下文。

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("已处理 %d 条记录", 12)
```

将配置与代码分开；敏感值从环境变量或安全配置服务读取。日志使用参数化格式，避免不必要的字符串拼接，也不要记录密码、令牌或完整个人信息。

## 日志要保留上下文，也要避开敏感信息

不要用大量 `print` 代替分级日志；也不要捕获异常后只打印“失败”，却丢失 traceback。需要记录异常时用 `logger.exception(...)`。

## 动手验证

**练习：**记录当前异常并保留堆栈。

```python
try:
    risky_operation()
except OSError:
    logger.exception("读取文件失败")
```

---

[上一篇：用 pytest 把预期行为留下来](/notes/python-23-testing) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 pyproject.toml 把项目变成可安装的包](/notes/python-25-packaging)

