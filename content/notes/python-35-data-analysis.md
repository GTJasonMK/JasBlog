---
title: "Python 35：NumPy、pandas 与图表：从数据形状开始分析"
date: "2026-11-12"
excerpt: "平均销售额算出来以前，先确认一行代表什么、缺失值意味着什么、连接有没有复制记录。借助NumPy数组和pandas表格说明形状、分组、连接与透视，避免API执行成功却回答了另一个问题。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一张表里只有团队和销售额两列，算平均值似乎直接调用 `.mean()` 就行。但如果一行有时代表一张订单，有时代表一天的汇总，得到的平均值就有不同含义。分析先要确认记录单位和字段口径，再选处理方式。

NumPy更接近数值数组，pandas更接近带标签的表格。它们可以组合使用，却不能忽略各自的数据组织方式。

## 先知道沿哪个方向算

NumPy的 `ndarray` 表示多维数组，每个轴的长度由 `shape` 描述，轴数是 `ndim`，元素表示由 `dtype` 描述。一个数组采用统一的dtype，方便批量数值计算：

```python
import numpy as np

values = np.array([[10, 20], [30, 40]])
print(values.shape)       # (2, 2)
print(values.mean(axis=0))  # 每列均值：[20. 30.]
```

这个 `(2, 2)` 数组有两行两列。沿 `axis=0` 求均值，会把每列的行位置聚合，得到20和30；沿 `axis=1` 则得到每行的均值15和35。轴表示被消去的方向，不能看到0就直接认定结果是一行还是一列。

向量化把整块运算交给数组实现，常能减少Python逐项循环的开销，但还要检查生成的中间数组和数据类型。两个不同形状的数组可能通过广播得到合法结果，也可能恰好广播成一张远大于预期的表。形状能运算，不代表运算含义就正确。

## 表格标签怎样参与计算

pandas的 `Series` 是带标签的一维数据，`DataFrame` 由行索引与多个字段组成，每列可以有不同类型。团队销售额的分组均值可以这样表达：

```python
import pandas as pd

df = pd.DataFrame({"team": ["A", "A", "B"], "sales": [10, 12, 8]})
print(df.groupby("team")["sales"].mean())
```

结果中A为11，B为8。这里假定每行都是可比较的一次观测；若不同记录代表的人数或期间不同，可能需要加权，而不能直接对均值再求均值。

处理真实表格，至少先查看 `shape`、`dtypes` 和每列缺失数量。pandas会按标签对齐一些运算，CSV推断出的文本列也未必能直接参与数值计算。不要从前几行看着像数字，就假定整列格式一致。

## 连接以后，记录数有没有变

下面这组订单需要补上客户所在地区，再生成分类与月度汇总：

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

`validate="many_to_one"` 表示多笔订单可以属于同一客户，但客户表的连接键应唯一。如果客户表同一ID出现两行，一次连接可能把订单复制成两行，后面的销售额就被重复累计。让连接约束直接失败，比在图表上猜哪个区域异常更早发现问题。

左连接会保留订单，但找不到客户时地区仍然缺失；这还需要根据业务决定拒绝、补录还是单独列为未知。匹配成功和连接关系符合预期，也应该分别检查。

示例为了演示后续操作，把缺失销售额当作0，但只有业务明确支持这个含义时才成立。若缺失表示尚未结算，填0会把未知结果变成确定的零收入。可以保留缺失并单独报告数量，也可以让分析先暂停，不能由API方便程度决定数据口径。

## 先确认 shape、dtype 和连接条件

`pivot_table` 按地区和商品汇总，并允许对重复组合执行 `sum` 等聚合；`pivot` 主要重排结构，要求相应索引与列组合唯一。用透视表自动把重复数据加起来，不能代替判断这些重复到底应该合并还是被拒绝。

时间重采样前，需要把日期解析成合适的时间类型，再设为时间索引。示例中的 `MS` 按月初标记月份。时区、交易日和跨月边界都可能影响分组；统计“本地月份”时，不能先按另一个时区切月，再认为结果完全等价。

文本筛选产生布尔掩码，取出销售额不低于10的记录则可以写：

```python
df.loc[df["sales"] >= 10]
```

`loc` 用筛选条件选择行，可以同时明确需要的列。选择以后是否复制、是否修改原数据，应使用清楚的赋值方式和当前pandas版本的规则，不依赖链式赋值碰巧产生的效果。

读CSV可以使用 `read_csv`，写出时 `to_csv(..., index=False)` 避免把内部行索引误当成业务字段。若内部索引本来就有业务含义，则应明确保存它，而不是一律删除。

图表放在这些检查之后才有意义。地区比较可以用条形图，时间趋势可以用折线图，并写清单位、统计期间与分母。画得整齐只能帮助读懂结果，不能补救错误的连接或解释。下一篇把这些步骤放到一份能核对总额的小数据上。
---

[上一篇：写一个订单 ETL 工具：读取、校验、转换和输出](/notes/python-34-etl-project) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：把订单 CSV 整理成能重跑的销售分析](/notes/python-36-analysis-project)

