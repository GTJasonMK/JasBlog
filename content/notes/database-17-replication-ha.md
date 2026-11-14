---
title: "数据库 17：副本有多新，切换时怎样避免两个主库"
date: "2026-11-13"
excerpt: "副本存在，不代表主库故障时一定不丢数据。需要看提交等到了哪个阶段、副本实际追到哪里，以及切换时怎样隔离旧主。复制、备份和高可用分别承担不同的恢复责任。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-recovery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

副本存在，不代表主库故障时一定不丢数据。需要看提交等到了哪个阶段、副本实际追到哪里，以及切换时怎样隔离旧主。复制、备份和高可用分别承担不同的恢复责任。

下面的架构推演不能代替跨主机高可用验证。

## 复制传递什么

PostgreSQL 物理流复制传递 WAL，备库重放后形成与主库接近的物理状态。主备一般使用相同大版本，升级按官方支持路径进行。逻辑复制按发布与订阅传输数据变化，可用于部分迁移场景，但 DDL、序列等对象不等于自动完整同步。

物理备库通常不能独立写入。异步复制允许主库在备库收到日志前返回成功，所以主库永久丢失时可能丢失已确认事务。同步复制可以等待特定备库达到指定阶段，但会增加延迟，并可能在同步备库不可用时阻塞提交。

`synchronous_commit=on` 本身不代表已部署同步备库，还要配置 `synchronous_standby_names` 等。等待远端写入、刷盘与回放是不同承诺；需要读后立即见的业务还要明确在哪个节点读取及等待什么位置。

## 创建物理备库的机制

部署过程包括网络和认证、复制权限、基础备份、连续日志、备库配置、回放与追平验证。以下是现场命令形态，`PRIMARY_HOST`、目录和复制槽需替换成经过审查的实际配置，不在示例主库上盲目执行：

```bash
pg_basebackup -h PRIMARY_HOST -U replicator -D /srv/postgresql/standby -R -X stream -C -S standby_01
```

`-R` 写入备用模式所需文件与连接配置；`-C -S` 创建并使用命名复制槽。密码使用受控凭据文件或组织 secret 方案，不写命令行。槽必须有监控和生命周期，备库永久丢失却保留槽会持续占用 WAL。

本命令不自动配置主库访问规则、操作系统权限、TLS、服务管理、选主或隔离旧主。第 16 章验证了物理恢复链，流复制和跨机故障仍需另建环境演练。

## 如何判断复制健康

主库查询：

```sql
SELECT application_name, client_addr, state, sync_state,
       sent_lsn, write_lsn, flush_lsn, replay_lsn,
       pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS replay_gap_bytes
FROM pg_stat_replication;

SELECT slot_name, slot_type, active, restart_lsn, wal_status,
       pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS retained_bytes
FROM pg_replication_slots;
```

备库检查 `pg_is_in_recovery()`、接收与回放位置。`now() - pg_last_xact_replay_timestamp()` 在主库空闲时也会增大，不能单独当作真实复制故障；结合主库是否有新提交、LSN 差和接收状态判断。

LSN 差是字节差，不直接等于多少秒业务延迟。转换为时间需要结合实际 WAL 生成和重放速率。同步状态正常也不能证明所有应用读请求都路由到了合适节点。

## 高可用还需要选主与隔离

主库无法被监控访问，可能只是网络分区，不代表主库已经停止写入。如果此时提升备库，而旧主仍接受请求，会形成双主分叉。

可靠切换需要判断和选举、隔离旧主的写入能力、确认候选备库进度、提升、切换入口、业务核对和旧主重建。连接池中的旧连接也要处理，DNS 更新不保证现有连接立即失效。

使用 Patroni 等成熟体系时，要理解其一致性存储、租约与 fencing 条件。引入自动化不会消除这些条件。托管数据库也需要核对服务商明确提供的 RPO、RTO、维护方式和故障切换语义。

## 不同故障需要不同方案

| 故障 | 常见手段 | 仍需注意 |
|---|---|---|
| 单实例崩溃 | 自动重启、主备切换 | 崩溃恢复时间、旧连接和重试 |
| 单机永久损毁 | 异机副本与备份 | 副本延迟、凭据与入口 |
| 可用区或地域故障 | 跨区部署与异地备份 | 网络延迟、成本、恢复演练 |
| 误删或恶意修改 | 历史备份与 PITR | 副本可能已同步错误 |

## 动手验证

给定异步主备相差 200 MB、主库每秒产生 20 MB WAL，不能据此承诺一定只丢 10 秒，说明需要哪些额外数据。设计主库网络隔离演练，写出隔离旧主、选择候选、切换、核对和回归步骤，不在单机实验中宣称已证明跨地域容灾。

参考：[热备与复制](https://www.postgresql.org/docs/16/high-availability.html)、[流复制](https://www.postgresql.org/docs/16/warm-standby.html#STREAMING-REPLICATION)、[逻辑复制限制](https://www.postgresql.org/docs/16/logical-replication-restrictions.html)。

---

[上一篇：用基础备份和连续 WAL 回到误删之前](/notes/database-16-wal-pitr) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：从业务延迟追到资源，再算容量预算](/notes/database-18-monitoring-capacity)
