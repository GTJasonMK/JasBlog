---
title: "数据库学习笔记：目录、实验和阅读顺序"
date: "2026-11-13"
excerpt: "会写SELECT以后，还要解释金额为何多算、最后一件库存怎样竞争、误删怎样找回。围绕同一套订单数据安排阅读与实验，让每一步都能用实际结果核对。"
tags: [ "数据库", "PostgreSQL" ]
category: "database"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

两张表关联后金额多了一笔，两个请求都买到最后一件库存，或者备份存在却恢复不了。这些问题比“SQL语法写对了吗”更往前一步，涉及结果粒度、共同提交与恢复条件。笔记用同一套订单数据把它们连起来。

主线使用 PostgreSQL 16，以 MySQL 8.4 作对照，SQL 都围绕同一套 shop 模型。阅读顺序可以按基础、事务、性能、恢复和运维推进，遇到具体问题也可以直接按主题查找。数据库操作能力要由实验和输出证明，实际值班还需要熟悉所在环境的权限、依赖和应急流程。

先把59700分的已支付订单算对，再观察错误连接为什么变成99500；先复现普通下单，再用两个连接检验竞争；最后从独立恢复结果确认数据真的可找回。概念不是孤立名词，它应能解释这些前后变化。

## 从这里开始

1. 阅读[第 1 章](/notes/database-01-environment)，启动[实验环境](/notes/database-lab-guide)，运行基线自检。
2. 按下面的阶段学习。每章依次做概念解释、示例复现和章末练习，不懂的术语查[术语表](/notes/database-glossary)。
3. 每个阶段完成[练习与验收](/notes/database-exercises)，用[学习记录模板](/notes/database-learning-template)保存 SQL、输出和判断，之后再看[参考答案](/notes/database-exercise-answers)。
4. 最后完成[订单系统综合项目](/notes/database-order-project)，提交数据正确性、性能、权限和恢复四类证据。

先具备基本的文件与终端操作能力即可。原阅读安排约 12 周，每周 8 至 10 小时，作为分配时间的参考；不熟悉 Linux 或网络时，可以多留一些时间给并发与恢复。

周次用于安排时间，推进依据仍是当前问题能否独立解释与验证。已经会写查询，就先做阶段一题目；如果卡在连接与目标确认，不必为了赶进度跳过它。生产操作尤其依赖环境知识，学完章节不等于已经获得任意系统的操作条件。

## 按主题阅读

| 阶段与建议周次 | 阅读顺序 | 阶段产出 |
|---|---|---|
| 一，第 1 至 3 周 | [01 环境](/notes/database-01-environment)、[02 内部机制](/notes/database-02-storage-execution)、[03 建模](/notes/database-03-modeling-types)、[04 SQL 基础](/notes/database-04-sql-basics)、[05 关联与汇总](/notes/database-05-joins-subqueries)、[06 窗口与报表](/notes/database-06-windows-reports) | 独立建表，写查询，解释结果行数和金额口径 |
| 二，第 4 至 5 周 | [07 事务与隔离](/notes/database-07-transactions-mvcc)、[08 锁与死锁](/notes/database-08-locks-deadlocks)、[09 订单一致性](/notes/database-09-orders-idempotency)、[10 应用接入](/notes/database-10-connections-application) | 复现并发问题，证明库存、幂等与事务边界正确 |
| 三，第 6 至 7 周 | [11 索引](/notes/database-11-indexes)、[12 执行计划](/notes/database-12-query-plans)、[13 维护与分区](/notes/database-13-vacuum-partitions) | 在 20 万行数据上比较计划、耗时和缓冲区访问 |
| 四，第 8 至 10 周 | [14 权限安全](/notes/database-14-security)、[15 备份恢复](/notes/database-15-backup-restore)、[16 PITR](/notes/database-16-wal-pitr)、[17 复制高可用](/notes/database-17-replication-ha)、[18 监控容量](/notes/database-18-monitoring-capacity)、[19 故障处理](/notes/database-19-troubleshooting)、[20 变更发布](/notes/database-20-migrations) | 完成隔离恢复和误删恢复，编写变更单与故障记录 |
| 五，第 11 至 12 周 | [21 MySQL](/notes/database-21-mysql)、[22 选型与扩展](/notes/database-22-cache-distribution)、[23 常用数据库对照](/notes/database-23-product-comparison)、[综合项目](/notes/database-order-project) | 比较产品与业务场景，将原理迁移到 MySQL，完成可复查的项目交付 |

已有 SQL 基础可先做阶段一验收，通过后从第 7 章开始。偏应用开发优先完成第 1 至 12、14、15、20 章；偏 DBA 或运维必须继续完成第 13 至 21 章及恢复实验。

遇到接口慢先从10、12与19定位等待，准备变更看20与操作速查，确认备份看15、16。直接按问题查读时，仍先核对各实验前置数据，尤其并发提交过以后不能再把三单基线当作当前真值。

## 示例约定

- 先下载[完整实验资源包](/downloads/database-labs.zip)，解压后所有带 `docker compose` 的命令都在 `database-labs` 目录运行。数据库名是 `db_lab`，实验管理员是 `lab_admin`，端口仅绑定本机 `127.0.0.1:55432`。
- 可直接运行的完整脚本集中在 `database-labs/sql`。正文 SQL 是逐段讲解示例；涉及修改的片段须按相邻步骤执行，不能把整篇一次性粘贴到生产终端。
- 商品金额、订单金额使用整数分，报表输出时再除以 `100.0`。时间使用 `timestamptz`，示例业务日期按 UTC 解释。
- `lab_admin` 是容器初始化的超级用户，只用于学习管理操作。应用权限练习使用独立角色。
- 实验固定 PostgreSQL 16 大版本，实际验证使用 16.15。`postgres:16` 标签会更新补丁版本，首次运行时保存版本与镜像摘要；需要严格复现时使用已记录的摘要。升级补丁先核对官方发布说明并重跑实验，不要只替换大版本镜像去读取旧数据卷。

## 如何判断自己已经掌握

| 能力 | 必须拿出的证据 |
|---|---|
| SQL 与建模 | 从业务规则推出键、约束和关系，查询结果与独立核对一致 |
| 并发正确性 | 两个会话的执行顺序、阻塞现象、事务结果和最终不变量 |
| 性能分析 | 同一数据与查询下的前后执行计划、重复测量、写入代价分析 |
| 安全变更 | 明确对象、影响行数、锁等待上限、核对方法和失败处置 |
| 备份容灾 | 在独立实例或数据库实际恢复，核对数据，记录恢复耗时和恢复点 |
| 故障处理 | 从业务症状找到等待、锁、慢 SQL 或存储证据，说明处置后如何确认恢复 |

实作检查项和不通过条件见[综合项目](/notes/database-order-project)。生产操作前另读[操作手册](/notes/database-runbooks)，它提供执行前后核对项和现场查询。

记录里把已运行、仅设计与待验证分开。PostgreSQL里的快照输出不能证明MySQL范围锁，单机恢复也不能证明跨机容灾；每项证据只承担它实际触及的范围，后续学习才知道还缺什么。

官方资料、版本核对范围和实验结果分别见[资料索引](/notes/database-references)与[实验记录](/notes/database-lab-results)。

## 配套文章

- [数据库练习参考：查询结果、并发顺序和判断依据](/notes/database-exercise-answers)
- [订单数据库实作：下单、并发、权限与恢复](/notes/database-order-project)
- [数据库动手练习：从查询到恢复的 33 个问题](/notes/database-exercises)
- [数据库术语速查：快照、日志、复制与恢复](/notes/database-glossary)
- [数据库官方资料：版本、主题与产品入口](/notes/database-references)
- [数据库操作速查：连接、等待、空间和恢复](/notes/database-runbooks)
- [数据库学习记录模板：保存过程、输出与待验证问题](/notes/database-learning-template)
- [数据库实验手册：启动环境与八组实验](/notes/database-lab-guide)
- [数据库实验记录：已测结果与适用范围](/notes/database-lab-results)
