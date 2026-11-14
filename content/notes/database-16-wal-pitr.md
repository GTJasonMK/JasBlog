---
title: "数据库 16：用基础备份和连续 WAL 回到误删之前"
date: "2026-11-13"
excerpt: "误删以后，恢复目标通常是错误发生之前的状态。这里用命名恢复点把位置说清楚，再把基础备份与连续 WAL 恢复到独立数据卷，通过两边不同的标记确认停在了哪里。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-recovery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

误删以后，恢复目标通常是错误发生之前的状态。这里用命名恢复点把位置说清楚，再把基础备份与连续 WAL 恢复到独立数据卷，通过两边不同的标记确认停在了哪里。

L7 使用独立容器和恢复数据卷，不覆盖原库。归档与基础备份仍和源库共用源数据卷，源卷丢失时它们也会丢失；这里验证本机恢复机制，异地容灾需要独立存储和另外的演练。

## 恢复链必须连续

PITR 需要一个可用的基础物理备份，以及从备份所需起点到目标点之间完整连续的 WAL。少一个必需日志段，恢复可能无法到达目标。过期删除策略必须同时理解基础备份和日志依赖，不能只保留“最近一天 WAL”。

恢复点可以按时间、事务或命名恢复点指定。误删发生时间不一定等于你发现问题的时间；本实验使用命名恢复点，避免时间输入和时区歧义。恢复目标必须晚于基础备份能达到一致状态的时刻。

## 1. 开启归档并确认成功

只在示例实例执行。先在 `database-labs` 目录创建归档和基础备份目录：

```bash
docker compose exec -T -u postgres db mkdir -m 700 /var/lib/postgresql/wal_archive
docker compose exec -T -u postgres db mkdir -m 700 /var/lib/postgresql/basebackup
docker compose exec db psql -X -U lab_admin -d db_lab
```

在交互 `psql` 中逐条执行，然后退出：

```sql
ALTER SYSTEM SET archive_mode = 'on';
-- shortcut: 本机复制只演示机制，异地备份需使用有校验、持久化和保留管理的归档工具。
ALTER SYSTEM SET archive_command =
    'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f';
\q
```

`archive_mode` 需要重启，不能只 reload。实验允许重启，生产先评估停机与可用性：

```bash
docker compose restart db
docker compose exec db psql -X -U lab_admin -d db_lab
```

```sql
SHOW archive_mode;
SHOW archive_command;
SELECT pg_switch_wal();
SELECT archived_count, failed_count, last_archived_wal,
       last_archived_time, last_failed_wal FROM pg_stat_archiver;
```

归档是异步的，确认归档计数增加、目录出现日志，再继续。不成功就查日志与目录权限，不能在失败状态下继续宣称备份链可用。

教学归档命令拒绝覆盖同名文件；极少数重新归档同一文件的情况会失败并重试。生产归档工具应确认已有文件内容相同且已持久化时才返回成功，内容不同必须报错。不能通过删原 WAL 或假成功处理归档故障。

## 2. 制作物理备份

仍在 `psql` 中创建标记后退出：

```sql
CREATE TABLE practice.recovery_marks (id integer PRIMARY KEY, note text NOT NULL);
INSERT INTO practice.recovery_marks VALUES (1, 'before base backup');
\q
```

在终端运行：

```bash
docker compose exec -T -u postgres db pg_basebackup -h /var/run/postgresql -U lab_admin -D /var/lib/postgresql/basebackup -Fp -X stream --checkpoint=fast --no-password
docker compose exec -T -u postgres db pg_verifybackup /var/lib/postgresql/basebackup
```

目录必须为空，重复演练应保存旧成果后选择新的实验环境。这里用本机 socket 与示例管理员取得复制能力，生产应使用最小复制权限和受控认证。

`-X stream` 同时取得备份所需 WAL，不表示备份之后的日志会自动永远保留。`pg_verifybackup` 检查清单等完整性，也不能替代真正恢复。

## 3. 建立恢复目标并模拟误删

重新进入交互 `psql`，保持自动提交，逐条执行，不能放在同一个 `BEGIN` 中：

```sql
INSERT INTO practice.recovery_marks VALUES (2, 'keep this committed row');
SELECT pg_walfile_name(pg_create_restore_point('db_lab_before_delete')) AS target_wal;
DELETE FROM practice.recovery_marks WHERE id = 2;
INSERT INTO practice.recovery_marks VALUES (3, 'after mistaken deletion');
SELECT pg_switch_wal();
SELECT * FROM practice.recovery_marks ORDER BY id;
SELECT last_archived_wal, last_archived_time, failed_count FROM pg_stat_archiver;
```

源库应只剩 1、3 两行。记下 `target_wal` 文件名，并确认该文件已经出现在归档目录：

```bash
docker compose exec -T db ls -l /var/lib/postgresql/wal_archive
```

不要只根据 `pg_switch_wal` 已返回就启动恢复，它不保证归档复制已经完成。

## 4. 在独立数据卷恢复

退出源库客户端。在终端执行以下完整命令，把基础备份复制到独立卷；源数据卷只读挂载。重复执行时若恢复目录已有 `PG_VERSION`，命令会失败，保护已有恢复成果。

```bash
docker compose -f compose.yaml -f compose.recovery.yaml run --rm --no-deps --entrypoint sh recovery -ec 'test ! -e "$PGDATA/PG_VERSION"; install -d -o postgres -g postgres -m 700 "$PGDATA"; cp -a /source/basebackup/. "$PGDATA/"; touch "$PGDATA/recovery.signal"; chown -R postgres:postgres "$PGDATA"'
docker compose -f compose.yaml -f compose.recovery.yaml up -d --wait recovery
docker compose -f compose.yaml -f compose.recovery.yaml logs recovery
docker compose -f compose.yaml -f compose.recovery.yaml exec recovery psql -X -U lab_admin -d db_lab
```

恢复配置通过 `restore_command` 读取已归档 WAL，并在命名目标暂停。服务端允许连接只表示达到可读状态，还要确认真正暂停在目标：

```sql
SELECT pg_is_in_recovery(), pg_get_wal_replay_pause_state(),
       pg_last_wal_replay_lsn();
SELECT * FROM practice.recovery_marks ORDER BY id;
```

预期仍在 recovery，回放状态为 `paused`，只有 1、2 两行。第 2 行恢复，第 3 行不存在，证明停在误删之前。日志也应说明到达指定恢复点。

如果未到达目标、仍在等待日志、或服务报目标无法到达，应检查归档连续性、目标名称、基础备份和日志。不能删掉目标参数让实例“先启动算成功”。

## 5. 核对、切换与保留

本实验保持恢复实例只读以便核对，不自动切换应用。真实事件中，应先确认业务完整性、权限、序列与允许的数据损失，围绕明确切换点停止原主写入、防止双写，再按组织流程提升和接入新实例。

保存证据后可停止恢复容器，不删除恢复数据卷：

```bash
docker compose -f compose.yaml -f compose.recovery.yaml stop recovery
```

归档开启后持续占用空间，需监控增长。实验结束若要关闭，在源库设置 `archive_mode='off'` 并重启，保留现有备份和日志直到完成验收。关闭后就不再拥有连续的新恢复链。

## 动手验证

提交基础备份校验输出、恢复点、目标 WAL 文件、源库与恢复库标记差异、暂停状态、恢复耗时。解释为什么同机两个卷不能抵御主机磁盘损毁，以及为什么 `pg_dump` 不能替代这里的基础物理备份。

参考：[连续归档与 PITR](https://www.postgresql.org/docs/16/continuous-archiving.html)、[pg_basebackup](https://www.postgresql.org/docs/16/app-pgbasebackup.html)、[备份校验](https://www.postgresql.org/docs/16/app-pgverifybackup.html)。

---

[上一篇：有备份文件之后，还要证明能恢复](/notes/database-15-backup-restore) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：副本有多新，切换时怎样避免两个主库](/notes/database-17-replication-ha)
