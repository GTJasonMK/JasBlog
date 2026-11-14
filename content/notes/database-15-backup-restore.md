---
title: "数据库 15：有备份文件之后，还要证明能恢复"
date: "2026-11-13"
excerpt: "备份任务成功只是第一步。我会把备份还原到独立数据库，再核对金额、流水、约束和权限；行数相同不足以证明内容正确，小库恢复几秒也不能直接变成生产恢复承诺。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-recovery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

备份任务成功只是第一步。我会把备份还原到独立数据库，再核对金额、流水、约束和权限；行数相同不足以证明内容正确，小库恢复几秒也不能直接变成生产恢复承诺。

## 先定义 RPO 与 RTO

RPO 是故障允许丢失多近的数据，RTO 是允许多久恢复业务。例如每天夜间一份备份、没有连续日志，接近下一次备份前故障时可能丢失近一天的数据。若要求最多丢 5 分钟，需要更连续的恢复机制，并监控实际归档延迟。

恢复时间包括定位故障、调取备份、还原、重放、数据核对、权限与连接切换等，不只是 `pg_restore` 的执行时长。用真实数据规模和演练记录验证目标。

## 三类备份的边界

逻辑备份导出表结构与数据，便于选择性恢复和跨版本迁移；物理备份保留数据库文件布局，需要匹配版本与恢复条件；基础物理备份配连续 WAL 支持时间点恢复。

`pg_dump` 提供一个数据库的一致视图，但不包含完整集簇的角色、所有配置或其他数据库。它生成的文件不能拿来接 WAL 做 PITR。正在运行的数据库数据目录也不能用普通文件复制当作一致物理备份。

`pg_dump` 客户端不能导出比自己更新的大版本服务器；恢复到更新版本通常更可行，跨版本前仍要验证扩展与 SQL 兼容性。实验使用同一镜像中的工具，避免版本错配。

## L6：备份到独立数据库

确保还没提交修改订单基线；若已经做了提交型并发实验，应改用自己保存的预期记录核对，不可硬套 3 单基线。以下命令在 `database-labs` 目录逐条执行，每条成功再继续：

```bash
umask 077
mkdir -p .local
docker compose exec -T db pg_dump -U lab_admin -d db_lab -Fc > .local/db_lab.dump
test -s .local/db_lab.dump
docker compose exec -T db pg_restore --list < .local/db_lab.dump > .local/db_lab.toc
docker compose exec -T db createdb -U lab_admin -T template0 db_lab_restore
docker compose exec -T db pg_restore -U lab_admin -d db_lab_restore --exit-on-error --single-transaction < .local/db_lab.dump
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab_restore < sql/02-checks.sql
```

使用新库避免覆盖原数据，`--exit-on-error` 让任何恢复错误直接失败，单事务防止留下一半恢复结果。重复演练时使用新的目标库名，或先核对并明确删除旧练习库；不要给未知目标添加 `--clean`。

这里源库与恢复库位于同一实例，所以已有角色和扩展库可用。恢复到空白服务器时还要准备角色、扩展二进制、版本、排序规则、权限与配置。`pg_dumpall --globals-only` 可导出全局对象，但文件可能包含密码散列，须严格保护并审查恢复顺序。

若把生产数据恢复到开发环境，可以在经过确认后使用 `--no-owner --no-privileges` 重新设定开发权限，但这不验证生产原始授权是否可恢复。

## 数据核对不能只有行数

示例基线脚本核对订单金额、库存流水和订单明细，实际业务还要比较主键范围、关键时间点、金额合计、异常关联、序列、视图、函数、权限、扩展及应用冒烟结果。行数相等的两张表仍可能内容完全不同。

可以按主键范围分块计算稳定排序后的摘要，或核对经过业务定义的合计。摘要算法、列格式、时区与排序必须一致；不能直接对没有确定顺序的输出求散列。

还原不可信来源的逻辑备份可能执行备份内的 SQL 或函数定义。恢复环境要隔离，审查来源和权限，不能拿来历不明的 dump 以生产管理员执行。

## 保留与异地保护

定义保留期、加密、不可变或离线副本、异地位置、删除权限、密钥恢复和定期演练。副本只能应对部分节点故障，误删和逻辑污染可能同步到副本，所以副本不能替代历史备份。

## 动手验证

提交备份大小、生成时间、目录清单、恢复目标、实际耗时和至少三种业务核对。解释 100 GB 数据恢复为何不能按 10 MB 实验线性承诺时间，列出存储吞吐、索引建立、并行度和网络等条件。

参考：[备份恢复](https://www.postgresql.org/docs/16/backup.html)、[pg_dump](https://www.postgresql.org/docs/16/app-pgdump.html)、[pg_restore](https://www.postgresql.org/docs/16/app-pgrestore.html)。

---

[上一篇：把连接身份、对象权限和数据安全分开检查](/notes/database-14-security) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：用基础备份和连续 WAL 回到误删之前](/notes/database-16-wal-pitr)
