---
title: "Python 35：NumPy、pandas 与图表：从数据形状开始分析"
date: "2026-11-12"
excerpt: "拿到一份表格，我会先看行数、字段类型和缺失值，再决定怎么汇总。NumPy 和 pandas 的 API 很多，但真正影响结果的，往往是数组形状、连接关系和字段含义。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

拿到一份表格，我会先看行数、字段类型和缺失值，再决定怎么汇总。NumPy 和 pandas 的 API 很多，但真正影响结果的，往往是数组形状、连接关系和字段含义。

NumPy 的 `ndarray` 是同类型多维数组，关键属性是 `shape`（每个轴长度）、`ndim`（轴数量）和 `dtype`（元素类型）。对整块数组运算称为向量化，通常比 Python 层逐项循环更简洁。

```python
import numpy as np

values = np.array([[10, 20], [30, 40]])
print(values.shape)       # (2, 2)
print(values.mean(axis=0))  # 每列均值：[20. 30.]
```

pandas 的 `Series` 是带标签的一维数据，`DataFrame` 是带行列标签的表格。常见分析顺序是读入 → 检查类型和缺失值 → 过滤/派生列 → 分组汇总 → 可视化 → 输出结论。

```python
import pandas as pd

df = pd.DataFrame({"team": ["A", "A", "B"], "sales": [10, 12, 8]})
print(df.groupby("team")["sales"].mean())
```

常用表格操作还包括缺失值、表连接、重塑、时间序列与文本筛选：

```python
import pandas as pd

orders = pd.DataFrame({
    "date": pd.to_datetime(["2025-01-02", "2025-01-10", "2025-02-03"]),
    "customer_id": [1, 2, 1],
    "product": ["Book", "Pen", "Book"],
    "sales": [20.0, None, 30.0],
})
customers = pd.DataFrame({"customer_id": [1, 2], "region": ["North", "South"]})

missing_count = orders["sales"].isna().sum()
joined = orders.merge(customers, on="customer_id", how="left", validate="many_to_one")
# 仅当业务定义“缺失销售额等于 0”时，才这样填充。
joined["sales"] = joined["sales"].fillna(0)
pivot = joined.pivot_table(
    index="region", columns="product", values="sales", aggfunc="sum", fill_value=0
)
monthly = joined.set_index("date").resample("MS")["sales"].sum()
books = joined["product"].str.contains("book", case=False, na=False)
```

从 CSV 读取可用 `pd.read_csv("orders.csv", parse_dates=["date"])`，写出可用 `to_csv(..., index=False)`。缺失值不能一概填零；先判断“缺失”的业务含义。`merge(validate=...)` 能检查连接键是否符合预期。

## 先确认 shape、dtype 和连接条件

`axis=0` 通常沿行方向聚合，结果对应每列；`axis=1` 对应每行。数据分析前先查看 `df.shape`、`df.dtypes`、`df.isna().sum()`，不要只看几行样本就假设全表格式一致。`pivot_table` 会聚合重复组合；`pivot` 要求索引与列组合唯一。

## 动手验证

**练习：**过滤出销售额至少 10 的记录。

```python
df.loc[df["sales"] >= 10]
```

---

[上一篇：写一个订单 ETL 工具：读取、校验、转换和输出](/notes/python-34-etl-project) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：把订单 CSV 整理成能重跑的销售分析](/notes/python-36-analysis-project)

