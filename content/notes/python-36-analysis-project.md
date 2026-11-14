---
title: "Python 36：把订单 CSV 整理成能重跑的销售分析"
date: "2026-11-12"
excerpt: "下面这份小数据有明确的订单、客户和地区关系。我会按读取、检查、连接、汇总和画图的顺序处理，并把预期汇总值列出来，方便判断分析过程有没有跑偏。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

下面这份小数据有明确的订单、客户和地区关系。我会按读取、检查、连接、汇总和画图的顺序处理，并把预期汇总值列出来，方便判断分析过程有没有跑偏。

示例数据直接写在程序里，便于离线复现。换成真实 CSV 时，还要确认字段含义和缺失值的处理规则。

安装依赖：`python -m pip install numpy pandas matplotlib`。

```python
from io import StringIO
import pandas as pd
import matplotlib.pyplot as plt

orders_csv = """order_id,date,customer_id,product,quantity,unit_price
O1,2025-01-03,C1,Book,2,12.5
O2,2025-01-04,C2,Pen,5,2.0
O3,2025-01-08,C1,Pen,3,2.0
O4,2025-02-02,C2,Book,1,12.5
O5,2025-02-09,C3,Notebook,2,4.0
"""
customers_csv = """customer_id,region
C1,North
C2,South
C3,North
"""

orders = pd.read_csv(StringIO(orders_csv), parse_dates=["date"])
customers = pd.read_csv(StringIO(customers_csv))
if orders["order_id"].duplicated().any() or orders.isna().any().any():
    raise ValueError("订单包含重复编号或缺失值")

df = orders.merge(customers, on="customer_id", how="left", validate="many_to_one")
if df["region"].isna().any():
    raise ValueError("存在未登记地区的客户")
df["revenue"] = df["quantity"] * df["unit_price"]
summary = df.groupby("region", as_index=False)["revenue"].sum()
monthly = df.set_index("date").resample("MS")["revenue"].sum()
by_region_product = df.pivot_table(
    index="region", columns="product", values="revenue", aggfunc="sum", fill_value=0
)
print(summary)
print(monthly)
summary.to_csv("region_summary.csv", index=False)
by_region_product.to_csv("region_by_product.csv")

summary.plot(x="region", y="revenue", kind="bar", legend=False)
plt.ylabel("Revenue")
plt.tight_layout()
plt.savefig("sales_by_region.png", dpi=150)
```

结果应为 North `39.0`、South `22.5`；月度合计为 January `41.0`、February `20.5`。把分析代码保存成脚本或 Notebook，并记录数据来源、字段含义、清理规则和结论，保证他人能重跑。

## 动手验证

**练习：**筛出产品名包含 `book` 的订单。

```python
books = df["product"].str.contains("book", case=False, na=False)
print(df.loc[books, ["order_id", "product", "revenue"]])
```

**易错点：**汇总前先确认数量和价格的类型、币种和缺失值；相关性或平均值不能自动证明因果关系。

**练习答案：**`books` 是布尔掩码；`df.loc[books, ...]` 返回 O1 和 O4 两条订单。

---

[上一篇：NumPy、pandas 与图表：从数据形状开始分析](/notes/python-35-data-analysis) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：机器学习流程：先分数据，再比较模型](/notes/python-37-machine-learning)

