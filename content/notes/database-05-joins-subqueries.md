---
title: "数据库 05：关联之后，为什么金额会多算"
date: "2026-11-13"
excerpt: "订单关联支付记录后，一笔订单可能变成多行。金额算多时，我会先检查关联基数，而不是马上加 DISTINCT。先把每一行的含义说清楚，才能决定在哪里连接、在哪里汇总。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-sql"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

订单关联支付记录后，一笔订单可能变成多行。金额算多时，我会先检查关联基数，而不是马上加 DISTINCT。先把每一行的含义说清楚，才能决定在哪里连接、在哪里汇总。

## 先推导关联基数

一个客户可以有多个订单，所以客户关联订单后，一位客户可能出现多行。`INNER JOIN` 保留匹配，`LEFT JOIN` 还保留左侧无匹配的行，右侧列补 `NULL`。

```sql
SELECT c.id, c.display_name, count(o.id) AS order_count,
       coalesce(sum(o.total_cents), 0) AS order_amount_cents
FROM shop.customers c
LEFT JOIN shop.orders o ON o.customer_id = c.id
GROUP BY c.id, c.display_name
ORDER BY c.id;
```

种子结果为张同学 2 单 49700 分、李同学 1 单 19900 分、王同学 0 单 0 分。若写成 `count(*)`，没有订单的客户也会被左连接补出的那一行计为 1。

## ON 与 WHERE 的位置改变结果

要保留没有已支付订单的客户，把支付状态放入连接条件：

```sql
SELECT c.id, count(o.id) AS paid_orders
FROM shop.customers c
LEFT JOIN shop.orders o
  ON o.customer_id = c.id AND o.status = 'paid'
GROUP BY c.id ORDER BY c.id;
```

若把 `o.status = 'paid'` 放入 `WHERE`，无订单客户的补空行会被过滤。你得到的客户集合就变了。

## 多个一对多关联会放大金额

订单 1 有一笔失败支付和一笔成功支付。下面是故意写错的查询：

```sql
SELECT sum(o.total_cents) AS wrong_amount
FROM shop.orders o
JOIN shop.payments p ON p.order_id = o.id
WHERE o.status = 'paid';
```

它返回 99500 分，因为订单 1 的 39800 分计算了两次。`SUM(DISTINCT total_cents)` 也不可靠，两笔不同订单可以有相同金额。

只需要判断存在成功支付时，使用 `EXISTS`，不会复制订单行：

```sql
SELECT sum(o.total_cents) AS paid_amount
FROM shop.orders o
WHERE o.status = 'paid'
  AND EXISTS (
      SELECT 1 FROM shop.payments p
      WHERE p.order_id = o.id AND p.status = 'succeeded'
  );
```

结果为 59700 分。如果需要支付汇总字段，先按 `order_id` 聚合支付表，再把每单一行的结果关联到订单。先说明报表粒度，再选择聚合位置。

## 子查询和集合运算

`EXISTS` 判断有没有匹配；`NOT EXISTS` 判断没有匹配。相关子查询引用外层列，优化器可能把它改写为连接，不应仅凭语法认定它一定逐行低效。

```sql
SELECT c.id, c.display_name FROM shop.customers c
WHERE NOT EXISTS (
    SELECT 1 FROM shop.orders o WHERE o.customer_id = c.id
);
```

`UNION ALL` 拼接结果并保留重复，`UNION` 还去重，`INTERSECT` 取交集，`EXCEPT` 取差集。去重有排序或哈希成本；只有业务要求去重才选择它，不能拿去重掩盖错误关联。

CTE 即 `WITH` 子查询可以命名中间结果，提高可读性。PostgreSQL 对部分 CTE 会内联，`MATERIALIZED` 会改变优化边界；不要假设所有 CTE 都一定物化或一定更快。

## 动手验证

写出“没有订单的客户”“每单成功支付金额”“已支付但支付金额不等于订单金额的异常”。先手算预期，再运行。解释为何单纯关联支付表后求和会出现 99500 分。

参考：[连接](https://www.postgresql.org/docs/16/queries-table-expressions.html)、[子查询](https://www.postgresql.org/docs/16/functions-subquery.html)。

---

[上一篇：把筛选、NULL 和修改范围写准确](/notes/database-04-sql-basics) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：用窗口函数做排名、累计和报表](/notes/database-06-windows-reports)
