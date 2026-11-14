---
title: "数据库 06：用窗口函数做排名、累计和报表"
date: "2026-11-13"
excerpt: "既要保留每笔订单，又要算客户内排名或累计金额时，窗口函数就很合适。这里最容易漏掉的是排序、窗口框架和报表口径，同一段 SQL 换个时区或状态条件，结果的含义就会改变。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-sql"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

既要保留每笔订单，又要算客户内排名或累计金额时，窗口函数就很合适。这里最容易漏掉的是排序、窗口框架和报表口径，同一段 SQL 换个时区或状态条件，结果的含义就会改变。

## 聚合与窗口的区别

`GROUP BY` 将多行折叠成一组一行；窗口函数在保留当前结果行的基础上查看相关行。

```sql
SELECT id, customer_id, total_cents,
       row_number() OVER (
           PARTITION BY customer_id ORDER BY created_at, id
       ) AS customer_order_no,
       sum(total_cents) OVER (
           PARTITION BY customer_id ORDER BY created_at, id
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS cumulative_cents
FROM shop.orders
ORDER BY customer_id, created_at, id;
```

`PARTITION BY` 定义每个客户的窗口，窗口内排序定义计算顺序。张同学的累计金额依次为 39800、49700 分。外层 `ORDER BY` 仍然负责最终输出顺序。

显式写 `ROWS` 是为了按行累计。默认窗口框架可能把排序值相同的同伴行一起纳入，遇到同时间记录时结果与预期不同。`row_number` 每行唯一编号，`rank` 并列后跳号，`dense_rank` 并列后不跳号，选择由业务排名规则决定。

## 取每个客户的最新订单

窗口结果要在外层筛选：

```sql
WITH ranked AS (
    SELECT id, customer_id, total_cents,
           row_number() OVER (
               PARTITION BY customer_id ORDER BY created_at DESC, id DESC
           ) AS rn
    FROM shop.orders
)
SELECT id, customer_id, total_cents FROM ranked WHERE rn = 1
ORDER BY customer_id;
```

`lag` 可以取前一行的金额或日期，用来分析相邻订单间隔。但它看到的是当前查询过滤后剩下的行，不一定是数据库里真正的上一笔事件。

## 报表必须规定口径

“每日销售额”至少要确定：按下单还是支付时间、哪些状态、是否扣退款、什么时区、是否包含税费、什么币种。示例只计算按创建日归类的已支付订单额：

```sql
SELECT (created_at AT TIME ZONE 'UTC')::date AS business_day,
       count(*) AS paid_orders, sum(total_cents) AS amount_cents
FROM shop.orders WHERE status = 'paid'
GROUP BY (created_at AT TIME ZONE 'UTC')::date
ORDER BY business_day;
```

没有订单的日期不会自动出现。要显示零值日期，先用 `generate_series` 产生日期集合，再左连接每日汇总。正式财务报表还要处理支付时间、退款、迟到事件与结账后的修订流程。

## 视图与物化视图

经常复用的报表可以保存为视图，视图每次查询仍读取当时基础数据；物化视图保存结果，需要刷新，因此存在延迟和刷新成本。并发刷新对唯一索引等有要求，不能只把普通视图换成物化视图就宣称查询与更新都免费。

## 大列表使用稳定游标

`OFFSET 100000` 仍需要处理前面的大量行，而且并发插入会改变偏移。按确定的排序键继续读取：

```sql
SELECT id, created_at, total_cents FROM shop.orders
WHERE customer_id = 1
  AND (created_at, id) < (timestamptz '2026-01-10 11:00:00+00', 2::bigint)
ORDER BY created_at DESC, id DESC LIMIT 20;
```

这里从订单 2 后继续，返回订单 1。游标应包含全部排序键，并与筛选条件绑定。它不能自动提供跨多次请求的一致快照；业务若要求固定导出结果，需要单独设计快照或导出任务。

## 动手验证

完成每位客户最新订单、客户内累计金额、2026 年 1 月 9 至 12 日每日已支付金额并补零。说明窗口框架和时区各会怎样改变结果。参考答案见[练习答案](/notes/database-exercise-answers)。

参考：[窗口函数](https://www.postgresql.org/docs/16/tutorial-window.html)。

---

[上一篇：关联之后，为什么金额会多算](/notes/database-05-joins-subqueries) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：快照稳定了，业务规则就一定正确吗](/notes/database-07-transactions-mvcc)
