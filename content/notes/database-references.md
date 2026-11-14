---
title: "数据库官方资料：版本、主题与产品入口"
date: "2026-11-13"
excerpt: "需要确认隔离、索引、恢复或产品限制时，我会沿这里的官方入口查具体版本。主线使用 PostgreSQL 16，MySQL 对照限定 8.4 与 InnoDB，不能把不同版本的行为混成同一个结论。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-resources"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

需要确认隔离、索引、恢复或产品限制时，我会沿这里的官方入口查具体版本。主线使用 PostgreSQL 16，MySQL 对照限定 8.4 与 InnoDB，不能把不同版本的行为混成同一个结论。

原资料的核对日期为 2026-11-13，实验版本记录为 PostgreSQL 16.15。镜像标签会推进补丁版本，实际运行时仍要保存自己的版本和摘要；已有运行范围见[实验记录](/notes/database-lab-results)。

## PostgreSQL

| 资料 | 对应章节与用途 |
|---|---|
| [16 版手册](https://www.postgresql.org/docs/16/index.html) | 版本入口，核对文档适用范围 |
| [SQL 教程](https://www.postgresql.org/docs/16/tutorial.html) | 第 1 至 6 章，基本操作 |
| [数据定义与约束](https://www.postgresql.org/docs/16/ddl.html) | 第 3、20 章，表、键与变化 |
| [数据类型](https://www.postgresql.org/docs/16/datatype.html) | 第 3 章，金额、时间、JSON |
| [查询](https://www.postgresql.org/docs/16/queries.html) | 第 4 至 6 章，连接、聚合、集合 |
| [事务隔离](https://www.postgresql.org/docs/16/transaction-iso.html) | 第 7 章，PG 的隔离级别实现与重试 |
| [显式锁](https://www.postgresql.org/docs/16/explicit-locking.html) | 第 8、19 章，锁与死锁 |
| [INSERT / ON CONFLICT](https://www.postgresql.org/docs/16/sql-insert.html) | 第 9 章，唯一键竞争 |
| [索引](https://www.postgresql.org/docs/16/indexes.html) | 第 11 章，访问方法与代价 |
| [联合索引](https://www.postgresql.org/docs/16/indexes-multicolumn.html) | 第 11 章，前导键与定位范围 |
| [CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html) | 第 11、20 章，并发建索引限制 |
| [EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html) | 第 12 章，估计与实际执行 |
| [pg_stat_statements](https://www.postgresql.org/docs/16/pgstatstatements.html) | 第 12、18 章，语句聚合统计 |
| [常规 VACUUM](https://www.postgresql.org/docs/16/routine-vacuuming.html) | 第 13 章，版本清理与防回卷 |
| [表分区](https://www.postgresql.org/docs/16/ddl-partitioning.html) | 第 13 章，裁剪与唯一性限制 |
| [角色](https://www.postgresql.org/docs/16/user-manag.html)、[权限](https://www.postgresql.org/docs/16/ddl-priv.html) | 第 14 章，认证身份与对象授权 |
| [TLS 客户端验证](https://www.postgresql.org/docs/16/libpq-ssl.html) | 第 14 章，verify-full 的语义 |
| [备份与恢复](https://www.postgresql.org/docs/16/backup.html) | 第 15、16 章，逻辑与物理备份区别 |
| [pg_dump](https://www.postgresql.org/docs/16/app-pgdump.html)、[pg_restore](https://www.postgresql.org/docs/16/app-pgrestore.html) | 第 15 章，导出范围与失败行为 |
| [连续归档与 PITR](https://www.postgresql.org/docs/16/continuous-archiving.html) | 第 16 章，恢复链、归档返回值和目标 |
| [pg_basebackup](https://www.postgresql.org/docs/16/app-pgbasebackup.html)、[pg_verifybackup](https://www.postgresql.org/docs/16/app-pgverifybackup.html) | 第 16 章，基础备份与校验 |
| [高可用与复制](https://www.postgresql.org/docs/16/high-availability.html) | 第 17 章，同步条件与故障切换 |
| [统计视图](https://www.postgresql.org/docs/16/monitoring-stats.html) | 第 18、19 章，活动、等待与复制 |
| [ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html) | 第 20 章，验证约束与锁要求 |

## MySQL 与工具

| 资料 | 用途 |
|---|---|
| [MySQL 8.4 手册](https://dev.mysql.com/doc/refman/8.4/en/) | 对照版本入口 |
| [InnoDB 隔离级别](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html) | 快照读、当前读、范围锁及 RC 差异 |
| [聚簇与二级索引](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html) | 主键体积与回表 |
| [原子 DDL](https://dev.mysql.com/doc/refman/8.4/en/atomic-ddl.html) | 原子执行与隐式提交的区别 |
| [在线 DDL 操作限制](https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html) | 实际支持的算法、锁与条件 |
| [备份与恢复](https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html) | 逻辑备份与 binlog 恢复 |
| [官方 Postgres 镜像说明源码](https://github.com/docker-library/docs/blob/master/postgres/README.md) | 镜像标签、PGDATA 自定义与卷挂载规则 |
| [Docker Compose](https://docs.docker.com/compose/) | 本机实验的启动、停止与卷生命周期 |
| [Psycopg 3 参数](https://www.psycopg.org/psycopg3/docs/basic/params.html) | 第 10 章驱动占位符，不适用于所有驱动 |

原资料记录了对 PostgreSQL 隔离级别、并发建索引、基础备份与 PITR，以及 MySQL 8.4 隔离、DDL 资料和镜像说明的核对。当时实验采用本机已有的 16.15，版本相关命令再以 16 版资料和实际运行核对。其余链接作为按主题继续阅读的入口，遇到版本差异以对应版本官方说明和实际实验为准。

## 第 23 章：常用数据库选型资料

以下资料用于核对产品定位、数据模型、事务与部署边界。PG 与 MySQL 沿用上面的版本资料；其余产品的版本、授权和商业功能应在正式选型时单独记录。

| 类别或产品 | 官方资料与阅读重点 |
|---|---|
| SQLite、MariaDB | [SQLite 适用场景](https://www.sqlite.org/whentouse.html)、[MariaDB Server 文档](https://mariadb.com/docs/server)：部署、并发及版本差异 |
| Oracle、SQL Server | [Oracle 概念](https://docs.oracle.com/en/database/oracle/oracle-database/26/cncpt/introduction-to-oracle-database.html)、[SQL Server 概述](https://learn.microsoft.com/en-us/sql/sql-server/what-is-sql-server?view=sql-server-ver17)：数据模型、工具、平台与版本范围 |
| 达梦、人大金仓 | [达梦安装与迁移](https://eco.dameng.com/document/dm/zh-cn/start/)、[金仓官方文档](https://docs.kingbase.com.cn/cn)：产品版本、兼容模式、驱动、迁移和平台适配 |
| TiDB、OceanBase、CockroachDB | [TiDB 概述](https://docs.pingcap.com/tidb/stable/overview/)、[OceanBase 官方项目](https://github.com/oceanbase/oceanbase)、[CockroachDB 官方项目](https://github.com/cockroachdb/cockroach)：分布式事务、协议兼容、组件与部署范围 |
| Redis、Valkey、Memcached | [Redis 持久化](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)、[Valkey 文档](https://valkey.io/topics/)、[Memcached 文档](https://docs.memcached.org/)：数据结构、持久化、复制与缓存职责 |
| MongoDB | [多文档事务](https://www.mongodb.com/docs/manual/core/transactions/)：单文档原子性、部署与读写关注配置 |
| Cassandra、HBase | [Cassandra 架构](https://cassandra.apache.org/doc/5.0/cassandra/architecture/overview.html)、[HBase 官方入口](https://hbase.apache.org/)：分区、RowKey、一致性与访问模型 |
| DynamoDB、Cosmos DB | [DynamoDB 核心组件](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)、[Cosmos DB 概述](https://learn.microsoft.com/en-us/azure/cosmos-db/overview)：分区、索引、一致性与计费模型 |
| Elasticsearch、OpenSearch | [Elastic 产品与部署](https://www.elastic.co/docs/get-started)、[OpenSearch 介绍](https://docs.opensearch.org/latest/getting-started/intro/)：搜索、索引、部署及生态边界 |
| ClickHouse、Doris、StarRocks | [ClickHouse 概述](https://clickhouse.com/docs/get-started/about/intro)、[Doris 概述](https://doris.apache.org/docs/3.x/gettingStarted/what-is-apache-doris/)、[StarRocks 官方项目](https://github.com/StarRocks/starrocks)：列式分析、表模型、导入与关联 |
| DuckDB、Snowflake、BigQuery | [DuckDB 官方项目](https://github.com/duckdb/duckdb)、[Snowflake 架构](https://docs.snowflake.com/en/user-guide/intro-key-concepts)、[BigQuery 概述](https://docs.cloud.google.com/bigquery/docs/introduction)：进程内分析与托管数仓的部署和成本边界 |
| InfluxDB、TimescaleDB | [InfluxDB 3 Core](https://docs.influxdata.com/influxdb3/core/)、[TimescaleDB 官方项目](https://github.com/timescale/timescaledb)：时序模型、版本与扩展；Timescale 厂商文档现使用 Tiger Data 品牌 |
| Neo4j | [图数据库入门](https://neo4j.com/docs/getting-started/)：属性图、Cypher 与图遍历 |
| pgvector、Milvus、Qdrant | [pgvector 官方项目](https://github.com/pgvector/pgvector)、[Milvus 官方项目](https://github.com/milvus-io/milvus)、[Qdrant 概述](https://qdrant.tech/documentation/overview/)：精确与近似检索、过滤、索引和部署形态 |

第 23 章比较产品的用途与代价，未对这些产品统一部署、跑分或核验全部商业功能。BigQuery 概述抓取遇到网络超时，金仓文档入口需要浏览器加载，保留官方入口供实际选型时核对；相应产品未计入逐页功能核验。

示例中的时长和机器资源建议只用于安排练习，不能作为数据库产品的性能或服务承诺。

---

[数据库目录](/notes/database-00-learning-guide)
