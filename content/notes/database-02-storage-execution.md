---
title: "数据库 02：一条 SQL 从执行到落盘经历了什么"
date: "2026-11-13"
excerpt: "写下一条 SELECT 或 UPDATE 之后，服务器还要处理权限、计划、数据页和日志。我把查询与写入分开梳理：查询要解释读了多少数据，提交要解释哪些内容已经持久化。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-sql"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

写下一条 SELECT 或 UPDATE 之后，服务器还要处理权限、计划、数据页和日志。我把查询与写入分开梳理：查询要解释读了多少数据，提交要解释哪些内容已经持久化。

## 一条 SELECT 如何运行

服务器解析语法、解析表和列名、检查权限，再由优化器选择执行计划。执行器根据计划读取页、过滤行、完成连接和排序，最后返回结果。预备语句可能复用部分处理结果，不能据此假定每次都重新产生最适合当前参数的计划。

优化器主要依赖统计信息估计行数与成本。数据分布变化而统计没有更新时，估计可能偏离实际，导致连接方式或扫描方式选择不当。SQL 写法正确，只说明结果符合语义，不说明访问成本低。

## 数据如何落到磁盘

PostgreSQL 表通常以堆文件存储，分成固定大小的页，默认页大小一般是 8 KB，实际值可查询 `SHOW block_size`。索引是单独的数据结构，保存键与定位信息。普通主键不会把堆表永久按主键顺序排列。

读取先经过 PostgreSQL 的共享缓冲区，也可能命中操作系统页缓存，最后才读磁盘。所以执行计划中的 `shared read` 表示数据块读入共享缓冲区，不等于一次物理磁盘读取。

```sql
SHOW block_size;
SHOW shared_buffers;
SELECT pg_size_pretty(pg_relation_size('shop.orders')) AS heap,
       pg_size_pretty(pg_indexes_size('shop.orders')) AS indexes,
       pg_size_pretty(pg_total_relation_size('shop.orders')) AS total;
```

`total` 还可能包含 TOAST 等附属存储。小表占用页数受最小分配和索引结构影响，不能用三行数据推断每行平均生产成本。

## 一条 UPDATE 如何持久化

在 MVCC 机制下，更新通常形成新行版本，旧版本保留到没有事务需要它。内存中的数据页变脏，相应 WAL 记录按先写日志规则持久化。默认同步提交要求提交所需的 WAL 刷入持久存储，数据页可以稍后由后台机制写回。

发生崩溃时，系统利用 WAL 恢复一致状态。检查点推进恢复起点，缩短需要重放的范围。检查点频繁会增加写入压力，过少则可能增加恢复时间和 WAL 占用。

提交返回成功的持久性取决于数据库设置与存储真实兑现刷盘。不能通过关闭 `fsync` 获得可用于企业承诺的性能数据。`synchronous_commit=off` 也会改变最近已确认事务在崩溃时的丢失风险。

## 三种容易混淆的“日志”

| 类型 | 用途 | 无法替代的部分 |
|---|---|---|
| WAL | 崩溃恢复、物理复制、PITR | 不直接记录业务审批与操作者意图 |
| SQL / 审计日志 | 查慢语句、访问者和操作过程 | 不能当成完整数据库备份 |
| 业务流水 | 解释支付、库存、账务变化 | 需要与业务事务保持一致，不能自动修复底层损坏 |

PostgreSQL 通过堆中的行版本提供 MVCC；MySQL InnoDB 主要通过 undo 链提供历史版本。两者都有重做日志，但内部对象和清理机制不同。

## 动手验证

画出一次下单中“语句执行、行版本、WAL、提交返回、数据页写回”的关系，解释为何提交不要求把所有修改页立刻写回。再说明命中内存时查询仍可能很慢的两个原因，例如扫描行过多或排序量过大。

参考：[WAL](https://www.postgresql.org/docs/16/wal-intro.html)、[物理存储](https://www.postgresql.org/docs/16/storage.html)。

---

[上一篇：先确认连的是谁、操作的是哪个库](/notes/database-01-environment) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：从业务事实推导表、约束和数据类型](/notes/database-03-modeling-types)
