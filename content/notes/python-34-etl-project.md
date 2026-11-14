---
title: "Python 34：写一个订单 ETL 工具：读取、校验、转换和输出"
date: "2026-11-12"
excerpt: "这里我用订单 JSON 转 CSV，把一个脚本拆成几个能单独验证的步骤。先确认输入格式和金额规则，再做计算和输出，这样出错时就知道失败发生在哪一层。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

这里我用订单 JSON 转 CSV，把一个脚本拆成几个能单独验证的步骤。先确认输入格式和金额规则，再做计算和输出，这样出错时就知道失败发生在哪一层。

金额使用 `Decimal`，避免二进制浮点表示造成的小数误差。

## 输入

创建 `orders.json`：

```json
[
  {"order_id": "A-1", "customer": "Ada", "quantity": 2, "unit_price": "12.50"},
  {"order_id": "A-2", "customer": "Lin", "quantity": 1, "unit_price": "8.00"}
]
```

## 实现 etl.py

```python
import argparse
import csv
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path


def transform(records):
    rows = []
    for record in records:
        try:
            order_id = record["order_id"]
            customer = record["customer"]
            quantity = record["quantity"]
            if not isinstance(order_id, str) or not isinstance(customer, str):
                raise TypeError("order_id 和 customer 必须是文本")
            if isinstance(quantity, bool) or not isinstance(quantity, int):
                raise TypeError("quantity 必须是整数")
            price = Decimal(str(record["unit_price"]))
        except (KeyError, TypeError, ValueError, InvalidOperation) as exc:
            raise ValueError(f"无效订单：{record!r}") from exc
        order_id = order_id.strip()
        customer = customer.strip()
        if not order_id or not customer or quantity <= 0 or not price.is_finite() or price < 0:
            raise ValueError(f"订单字段超出允许范围：{record!r}")
        rows.append({
            "order_id": order_id,
            "customer": customer,
            "quantity": quantity,
            "total": f"{price * quantity:.2f}",
        })
    return rows


def run(source, destination):
    records = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(records, list):
        raise ValueError("JSON 根节点必须是订单列表")
    rows = transform(records)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["order_id", "customer", "quantity", "total"])
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description="把订单 JSON 转成 CSV 汇总表")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    run(args.source, args.destination)


if __name__ == "__main__":
    main()
```

运行：`python etl.py orders.json output/orders.csv`。相同输入每次生成相同输出，便于重跑；输出文件会被覆盖，正式任务应先确认目标文件策略。

## 最小测试

```python
from decimal import Decimal
from etl import transform


def test_transform_calculates_total():
    rows = transform([{
        "order_id": "A-1", "customer": "Ada", "quantity": 2, "unit_price": "12.50"
    }])
    assert rows[0]["total"] == "25.00"
```

**验收：**正常输入生成正确 CSV；缺字段、负数量、非列表 JSON 明确失败；测试可独立运行。

## 覆盖策略和数值边界要提前确定

订单编号与客户名必须是非空文本，数量必须是正整数，金额必须是有限且非负的十进制数。输出路径存在时当前实现会覆盖文件；生产流程应明确是否覆盖、追加或原子替换。

## 动手验证

**练习：**在转换结果中增加每个订单的含税价，税率固定为 5%。

**答案：**在 `transform` 中计算 `taxed_total = price * quantity * Decimal("1.05")`，再用 `f"{taxed_total:.2f}"` 保存。真实业务应把税率作为显式配置并按适用规则处理。

---

[上一篇：自动化脚本：先让任务能安全重跑](/notes/python-33-automation) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：NumPy、pandas 与图表：从数据形状开始分析](/notes/python-35-data-analysis)

