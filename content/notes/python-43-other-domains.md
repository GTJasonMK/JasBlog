---
title: "Python 43：采集、办公、GUI 与科学计算：Python 的几条延伸方向"
date: "2026-11-12"
excerpt: "学完语言基础后，工具不必一次全装上。我会从手头要处理的输入和输出反推需要什么：网页、Excel、桌面交互或数值计算，各有一套更合适的入口。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

学完语言基础后，工具不必一次全装上。我会从手头要处理的输入和输出反推需要什么：网页、Excel、桌面交互或数值计算，各有一套更合适的入口。

五条主路线之外，Python 也常用于网页采集、办公文件、桌面工具和科学计算。这里给出最小可操作示例；这些例子是入口，完整业务仍需按场景补上数据校验、测试和错误处理。

## 网页采集

优先查找公开 API；读取 HTML 时可用 `httpx` 请求、Beautiful Soup 解析。设置超时，检查 HTTP 状态，并遵守站点规则与访问频率。

```python
import httpx
from bs4 import BeautifulSoup

response = httpx.get("https://example.com", timeout=10)
response.raise_for_status()
soup = BeautifulSoup(response.text, "html.parser")
print(soup.title.get_text(strip=True) if soup.title else "无标题")
```

安装：`python -m pip install httpx beautifulsoup4`。如果页面内容由 JavaScript 渲染，静态 HTML 可能不含目标内容；先检查 API，再考虑浏览器自动化工具。

## Excel 办公文件

`openpyxl` 读取和写入 `.xlsx`；`read_only=True` 适合大表扫描，`data_only=True` 读取 Excel 已保存的公式结果。

```python
from openpyxl import load_workbook

book = load_workbook("sales.xlsx", read_only=True, data_only=True)
try:
    sheet = book["Sales"]
    for row in sheet.iter_rows(min_row=2, values_only=True):
        print(row)
finally:
    book.close()
```

安装：`python -m pip install openpyxl`。读取 `data_only=True` 时，公式结果取决于文件是否由电子表格软件重新计算并保存。

## 桌面 GUI

小型桌面工具可从标准库 Tkinter 入门。GUI 事件循环负责响应点击；事件回调应快速结束，长任务需放到工作线程并把界面更新交回主线程。

```python
import tkinter as tk

root = tk.Tk()
root.title("计数器")
count = tk.IntVar(value=0)
tk.Label(root, textvariable=count).pack(padx=16, pady=8)
tk.Button(root, text="加一", command=lambda: count.set(count.get() + 1)).pack()
root.mainloop()
```

## 科学计算

NumPy 提供数组运算；SciPy 在此基础上提供优化、统计和信号处理等算法。数值计算前应确认单位、数据范围和误差容忍度。

```python
import numpy as np
from scipy.optimize import curve_fit

x = np.array([0.0, 1.0, 2.0, 3.0])
y = np.array([1.1, 2.9, 5.2, 6.8])
line = lambda x, slope, intercept: slope * x + intercept
parameters, _ = curve_fit(line, x, y)
print(parameters)  # 拟合得到斜率和截距
```

安装：`python -m pip install numpy scipy`。分析结果还应检查残差和模型假设，不能只看拟合参数。

## LLM 服务调用

不同服务的 URL、请求体和响应字段并不统一；把服务差异放在一个客户端函数内，设置超时、检查状态、验证响应，并从环境变量读取凭证。

```python
import os
import httpx

api_url = os.environ["MODEL_API_URL"]
api_token = os.environ["MODEL_API_TOKEN"]
response = httpx.post(
    api_url,
    headers={"Authorization": f"Bearer {api_token}"},
    json={"input": "用一句话解释 Python 列表"},  # 按服务商接口调整
    timeout=30,
)
response.raise_for_status()
result = response.json()
```

不要把密钥写进源码或 Notebook。对模型输出仍要按应用要求验证；输出文本不能直接当作可信指令或 SQL 执行。

## 外部系统的格式和状态都可能变化

这些例子依赖外部系统和库：网页结构可能改变，Excel 公式值可能过期，GUI 回调不能阻塞事件循环，模型服务响应也必须按实际 schema 校验。先隔离外部调用，再测试转换和业务逻辑。

## 动手验证

**练习：**以上方向中，哪些任务适合线程或异步 I/O？

**答案：**HTTP 请求通常受网络等待影响，可考虑线程或异步客户端；Excel 解析和科学计算则要测量 CPU/内存瓶颈，再决定批处理、向量化或进程并行。

---

[上一篇：用 FastAPI 和 SQLite 做一个任务 API](/notes/python-42-backend-project) · [Python 目录](/notes/python-00-learning-guide)

