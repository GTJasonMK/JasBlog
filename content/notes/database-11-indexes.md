---
title: "数据库 11：按查询设计索引，也把写入代价算进去"
date: "2026-11-13"
excerpt: "索引要从具体查询反推。比如查某个客户最新的已支付订单，筛选、排序和返回字段都影响键的顺序；多建一个索引，还会增加每次写入和后续维护的成本。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-performance"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

索引要从具体查询反推。比如查某个客户最新的已支付订单，筛选、排序和返回字段都影响键的顺序；多建一个索引，还会增加每次写入和后续维护的成本。

## B-tree 如何减少工作量

B-tree 按有序键组织节点，树高相对较小，可以定位键范围并顺序访问相关叶子。找到少量记录的成本大致是树路径加匹配项访问；若匹配大部分表，索引加随机回表可能比顺序扫描更贵。不能把所有查询都概括成 `O(log N)`。

每增加一个索引，都增加存储、缓存占用和插入更新维护。更新索引涉及页写入和 WAL；索引也需要备份与维护。索引价值取决于它节省的读成本是否值得这些写成本。

## 联合索引按查询顺序设计

实验查询是某客户、某状态的最新 20 单：

```sql
SELECT id, created_at, total_cents FROM practice.orders_perf
WHERE customer_id = 42 AND status = 'paid'
ORDER BY created_at DESC, id DESC LIMIT 20;
```

对应候选索引为 `(customer_id, status, created_at DESC, id DESC) INCLUDE (total_cents)`。等值条件先缩小范围，后面的排序列让执行器按顺序取前 20 行。这个顺序要结合其他查询复用和数据分布判断，并非“等值列永远有唯一固定顺序”。

联合索引主要按前导键分组排序。缺少前导条件不代表绝不可能使用它，优化器也可能选择整索引扫描，但不能假定仍能高效定位小范围。是否划算看执行计划，不能拿“最左前缀”口号代替测量。

`INCLUDE` 列作为覆盖数据，不参与定位和排序。Index Only Scan 还需要可见性信息，若页面没有标为全可见，仍会发生 heap fetch。覆盖索引不是永远不用访问表。

## 不同访问方式用不同索引

| 索引方式 | 适用场景 | 主要限制 |
|---|---|---|
| B-tree | 等值、范围、排序、唯一性 | 大量匹配时可能不如顺序扫描 |
| GIN | `jsonb` 包含、数组、全文检索 | 写入和维护成本较高，操作符类要匹配查询 |
| GiST | 范围、空间和近邻等可扩展搜索 | 具体能力取决于数据类型和操作符类 |
| BRIN | 巨大且与物理顺序相关的时间等字段 | 摘要较粗，需要回查；随机分布可能无效 |
| 部分索引 | 只对待处理或活跃子集建索引 | 查询条件需能推出索引谓词 |
| 表达式索引 | 如按 `lower(email)` 查询 | 查询表达式和函数属性要匹配 |

主键和唯一约束会建立相应索引。PostgreSQL 不会自动为每个外键的引用方创建索引；删除父行、关联查询等操作可能因此扫描子表。先核对已有索引再补，避免重复。

## 让条件可用于定位

对索引列施加函数或不匹配的隐式转换，可能阻碍普通索引定位。按时间范围比较通常比 `created_at::date = ...` 更适合普通时间索引。`LIKE '%keyword%'` 通常不能直接依赖普通 B-tree 前缀定位，可按需求评估全文或 trigram 索引。

索引条件匹配还受排序规则、类型、参数化计划和数据分布影响。高选择性不是固定字段属性，“状态只有三种所以一定没用”也不成立，例如待处理只占极少量时，部分索引可能很有价值。

## 在线建立也会消耗资源

`CREATE INDEX CONCURRENTLY` 降低阻塞写入的影响，但需要更多工作、可能等待旧事务，且不能放进普通事务块。失败可能留下无效索引，发布后检查：

```sql
SELECT c.relname, i.indisready, i.indisvalid
FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
WHERE i.indrelid = 'shop.orders'::regclass;
```

生产上先评估表大小、额外磁盘、WAL、复制延迟与取消方案。没有锁住所有写入，不代表没有运行影响。

## 动手验证

为客户订单列表、待发送事件、按商品查订单设计候选索引。对每个索引写出受益查询、键顺序、是否可复用现有索引、写入代价。下一章在大一点的数据上验证。

参考：[索引](https://www.postgresql.org/docs/16/indexes.html)、[并发建索引](https://www.postgresql.org/docs/16/sql-createindex.html)。

---

[上一篇：事务接到应用里，还要管连接、超时和重试](/notes/database-10-connections-application) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：从执行计划解释查询为什么慢](/notes/database-12-query-plans)
