---
title: "Python 20：命令行、子进程和 HTTP：处理外部输入"
date: "2026-11-12"
excerpt: "脚本一旦要接收参数、调用程序或访问接口，就开始和外部环境打交道。我会把超时、返回状态和输入校验放在调用边界，后面的转换函数只处理已经确认的数据。"
tags: [ "Python", "标准库与工程实践" ]
category: "python-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

脚本一旦要接收参数、调用程序或访问接口，就开始和外部环境打交道。我会把超时、返回状态和输入校验放在调用边界，后面的转换函数只处理已经确认的数据。

`argparse` 生成命令行接口；`subprocess.run` 可调用外部程序；HTTP 客户端负责与 Web API 通信。外部输入和远程响应都是不可信边界，需设置超时、检查状态并验证数据。

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("name")
args = parser.parse_args()
print(f"你好，{args.name}")
```

HTTP 示例使用第三方 `httpx`：

```python
import httpx

response = httpx.get("https://example.com", timeout=10)
response.raise_for_status()
print(response.status_code)
```

## 参数和命令不能直接拼接

不要把用户输入拼接成 shell 命令；调用子进程时优先传参数列表并保持 `shell=False`。不要在代码中写入 API 密钥。

## 动手验证

**练习：**为什么 HTTP 请求必须设置超时？

**答案：**网络可能永远无响应；超时让程序能及时失败、重试或向用户报告，而不会无限挂起。

---

[上一篇：正则、日期与时间：格式之外还有语义](/notes/python-19-regex-datetime) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：虚拟环境与项目结构：让依赖跟着项目走](/notes/python-21-environments-projects)

