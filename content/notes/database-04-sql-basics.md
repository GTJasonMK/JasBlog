---
title: "数据库 04：把筛选、NULL 和修改范围写准确"
date: "2026-11-13"
excerpt: "SQL 能执行，只能说明语法被接受。我更关心它选中了哪些行、缺失值怎样参与判断，以及一次更新会不会改到预期之外的数据。下面从查询结果的粒度开始。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-sql"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

SQL 能执行，只能说明语法被接受。我更关心它选中了哪些行、缺失值怎样参与判断，以及一次更新会不会改到预期之外的数据。下面从查询结果的粒度开始。

## 先知道一行代表什么

每次查询都先说明结果粒度。例如下面每行代表一个有库存、价格不超过 200 元的商品：

```sql
SELECT id, sku, name, price_cents / 100.0 AS price_yuan, stock
FROM shop.products
WHERE stock > 0 AND price_cents <= 20000
ORDER BY price_cents DESC, id ASC;
```

`WHERE` 决定进入结果的行，`SELECT` 决定输出列，`ORDER BY` 决定顺序。没有排序就没有可依赖的返回顺序。排序列不唯一时补上唯一键，否则分页可能漏行或重复。

数值和文本的边界不同。`'001'` 是文本，`1` 是数值；字符串使用单引号，双引号标识对象名。通常使用小写下划线命名，减少引号和大小写带来的困扰。

## NULL 与三值逻辑

`NULL` 表示缺失或未知，`= NULL` 的结果不是 `true`。判断缺失使用 `IS NULL`。`WHERE` 只保留结果为 `true` 的行，`false` 和未知都会过滤。

```sql
SELECT id, order_id FROM shop.outbox WHERE delivered_at IS NULL;
SELECT count(*) AS all_events,
       count(delivered_at) AS delivered_events
FROM shop.outbox;
```

`COUNT(*)` 计所有行，`COUNT(column)` 忽略该列的 `NULL`。`SUM` 在没有输入行时返回 `NULL`，需要业务上明确“无记录就是零”时再用 `coalesce(sum(...), 0)`。不要用零混淆未知金额。

`NOT IN` 的候选集合含 `NULL` 时容易得到未知；需要表达“没有对应记录”时通常使用 `NOT EXISTS`，下一章练习。

## 时间和字符串筛选

```sql
SELECT id, created_at FROM shop.orders
WHERE created_at >= timestamptz '2026-01-10 00:00:00+00'
  AND created_at <  timestamptz '2026-01-11 00:00:00+00'
ORDER BY created_at, id;
```

半开区间避免漏掉带小数秒的日末记录。业务日期如果按上海解释，就先把当地日界转换为准确时刻。`created_at::date = ...` 受会话时区影响，也可能使普通时间索引不能直接利用。

文本匹配 `LIKE 'KEYBOARD%'` 中 `%` 表示任意长度，`_` 表示一个字符。用户输入若按字面搜索，需要转义这些通配符；参数绑定只解决 SQL 结构注入，不会自动把通配符变成字面含义。

## 安全地修改

先核对候选行，再在事务中修改并检查 `RETURNING`。下面会回滚，不会改变基线：

```sql
BEGIN;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
SELECT id, name, price_cents FROM shop.products WHERE id = 1;
UPDATE shop.products
SET price_cents = 20900, updated_at = now()
WHERE id = 1 AND price_cents = 19900
RETURNING id, price_cents;
ROLLBACK;
```

旧值条件能检测你核对后发生的并发变化。返回零行时停止判断原因，不要去掉条件强行执行。多行变更需要将实际行数与审批预期比较，生产操作方法见第 20 章。

`INSERT ... RETURNING id` 取得服务端生成的身份。`DELETE` 删除行但通常保留可回滚的事务语义；`TRUNCATE` 的锁、触发器和外键行为不同，不能视为带条件删除的替代品。PostgreSQL 大部分 DDL 可在事务中回滚，MySQL 很多 DDL 会隐式提交。

## 聚合的顺序

```sql
SELECT status, count(*) AS orders, sum(total_cents) AS amount_cents
FROM shop.orders
GROUP BY status
HAVING count(*) >= 1
ORDER BY status;
```

理解查询时按 `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT` 的逻辑顺序分析。实际物理执行由优化器安排。`WHERE` 过滤分组前的行，`HAVING` 过滤汇总后的组。

## 动手验证

查出零库存商品、2026 年 1 月 10 日 UTC 创建的订单、每种状态的订单数和金额。事务内尝试负库存写入，观察约束错误后必须 `ROLLBACK`；确认基线自检仍通过。

参考：[SQL 查询](https://www.postgresql.org/docs/16/queries.html)。

---

[上一篇：从业务事实推导表、约束和数据类型](/notes/database-03-modeling-types) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：关联之后，为什么金额会多算](/notes/database-05-joins-subqueries)
