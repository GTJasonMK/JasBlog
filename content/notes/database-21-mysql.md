---
title: "数据库 21：把 PostgreSQL 的经验迁到 MySQL 时，要重查哪些行为"
date: "2026-11-13"
excerpt: "两套数据库都支持事务，默认隔离、行版本、范围锁和 DDL 行为却不一样。这里限定 MySQL 8.4 与 InnoDB，用具体操作对照差异；这些 SQL 需要独立的 MySQL 实验实例。"
tags: [ "数据库", "PostgreSQL", "MySQL" ]
category: "database-choices"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

两套数据库都支持事务，默认隔离、行版本、范围锁和 DDL 行为却不一样。这里限定 MySQL 8.4 与 InnoDB，用具体操作对照差异；这些 SQL 需要独立的 MySQL 实验实例。

## 先核对环境

```sql
SELECT VERSION(), DATABASE(), CURRENT_USER(), USER();
SELECT @@transaction_isolation, @@autocommit, @@sql_mode,
       @@time_zone, @@character_set_server, @@collation_server;
```

`CURRENT_USER()` 表示授权身份，`USER()` 表示客户端提供的用户与来源。账号是用户与主机范围的组合，不能只按用户名理解权限。MySQL 8.4 默认认证与旧客户端兼容性不同，不应为迁就过期客户端随意恢复旧认证方式。

## 两个系统的关键区别

| 主题 | PostgreSQL 16 | MySQL 8.4 / InnoDB |
|---|---|---|
| 默认隔离 | Read Committed | Repeatable Read，需核对实际配置 |
| 主键存储 | 堆与索引分离 | 聚簇主键存行，二级索引携带主键 |
| 历史版本 | 堆中多版本，VACUUM 回收 | undo 链，purge 清理 |
| 日志职责 | WAL 参与恢复与复制 | redo 支持崩溃恢复，binlog 支持复制和时间点恢复 |
| 自增列 | identity / sequence | AUTO_INCREMENT，同样可能空洞 |
| 条件唯一性 | 支持部分唯一索引 | 不直接支持同样的部分索引语法，需重新设计 |
| DDL 事务 | 大部分可回滚，部分操作例外 | 很多 DDL 隐式提交；原子 DDL 不等于用户可回滚 |
| JSON 与布尔 | `jsonb`、原生 boolean | JSON 操作与索引方式不同，BOOLEAN 是类型别名 |

InnoDB 的二级索引命中后可能还要按主键取完整行，覆盖查询可减少回表。过长主键会让多个二级索引一起变大。不要据此机械选择随机 UUID 或整型，应结合身份需求、写入分布与索引体积测量。

排序规则也会改变唯一性。MySQL 的 `_ci` 规则通常不区分大小写，`_ai` 通常不区分重音；迁移邮箱或 SKU 前，要按目标规则查出冲突。时间列的 `TIMESTAMP`、`DATETIME` 与 PG `timestamptz` 也不能直接等同，先确定有效范围、业务时区和驱动转换方式。

## 对照实验：范围锁

只在独立 MySQL 学习库执行：

```sql
CREATE DATABASE mysql_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE mysql_lab;
CREATE TABLE stock (
    id bigint PRIMARY KEY,
    quantity int NOT NULL CHECK (quantity >= 0)
) ENGINE=InnoDB;
INSERT INTO stock VALUES (1, 10), (3, 10);
```

A 设置隔离并锁范围：

```sql
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
SELECT * FROM stock WHERE id BETWEEN 1 AND 3 FOR UPDATE;
```

B 执行 `START TRANSACTION; INSERT INTO stock VALUES (2,10);`，通常因范围内 gap / next-key 锁等待。A 回滚后 B 继续，B 也回滚，保持数据不变。

将 A 改为 Read Committed 重做，该范围的普通 gap 保护通常不再出现，B 的插入可继续；外键检查与重复键检查等仍有例外。结果还取决于实际索引与访问路径，因此保留计划和锁证据。

InnoDB 的 RR 普通一致性读使用快照，锁定读与写入使用当前状态并涉及锁。混用它们不能简单推断“事务里永远只看到第一次的所有数据”。PG 的 MVCC 与锁机制不能原样套到 InnoDB。

## 排查与优化入口

```sql
EXPLAIN FORMAT=TREE SELECT * FROM stock WHERE id = 1;
EXPLAIN ANALYZE SELECT * FROM stock WHERE id = 1;
SELECT * FROM performance_schema.data_lock_waits;
SHOW ENGINE INNODB STATUS\G
SHOW REPLICA STATUS\G
```

`EXPLAIN ANALYZE` 实际执行支持的语句，不能拿未知写操作当只读解释。`SHOW ENGINE INNODB STATUS` 可查看最近死锁等线索，但不是完整历史审计。`SHOW REPLICA STATUS` 的延迟值也不能单独证明副本最新。

慢查询关注 `performance_schema` 的语句摘要、实际执行计划、锁等待和 I/O。比较 `rows`、过滤、覆盖、排序和临时表；不要把 `Using filesort` 一律解释为磁盘排序。

## 备份、恢复与发布

`mysqldump --single-transaction` 对 InnoDB 可取得一致数据视图，但不能把并发 DDL、非事务表和全局配置也自动纳入同等保证。带例程、事件和触发器时明确导出范围与权限，恢复到独立实例验证。

MySQL PITR 通常是可恢复的全量备份加连续 binlog，按精确位置或经核对的事务范围重放。GTID 标识复制事务，不等于“无需备份”。不要以最后一条日志能打开来判断整个恢复链完整。

`innodb_flush_log_at_trx_commit` 与 `sync_binlog` 影响本地持久性，副本确认策略影响故障后的数据丢失。更改参数前说明容许丢失的事务范围，并实际测量；不能仅为跑分关闭刷盘。

`ALGORITHM=INSTANT`、`INPLACE`、`LOCK=NONE` 只在支持的具体操作和条件下可用；还可能有 metadata lock 等待。要求明确算法时让不支持的操作报错，不接受悄悄退化成长时间复制表。先查 8.4 官方对应 DDL 限制并在同规模环境演练。

## 动手验证

在独立 MySQL 实例复现 gap 锁实验、原子库存扣减、唯一键幂等和逻辑恢复。说明为什么 PG 的部分唯一索引、事务化 DDL 和 `RETURNING` 示例不能直接复制。没有真实运行 MySQL 时，将此项标记为未完成，不以阅读代替验收。

参考：[8.4 隔离级别](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html)、[InnoDB 索引](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)、[在线 DDL](https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl.html)、[备份恢复](https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html)。

---

[上一篇：从调用方到历史数据，完成一次可核对的迁移](/notes/database-20-migrations) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：什么时候该加缓存、分析库或分片](/notes/database-22-cache-distribution)
