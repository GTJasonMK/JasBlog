---
title: "数据库实验手册：启动环境与八组实验"
date: "2026-11-13"
excerpt: "先确认实验库，再用同一份虚构订单复现SQL、并发、索引和恢复。按八组实验保存预期与输出，明确哪些步骤回滚、哪些成果会留下，避免重复初始化覆盖已做内容。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-labs"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

同一份数据先用于核对查询，再制造竞争，最后用于备份恢复。如果每次随意重新初始化，结果不同很难知道是理解有误，还是输入已经变了。这个手册把环境、基线与各实验留下的状态一并说明，按需要接着做。

[下载完整实验资源包](/downloads/database-labs.zip)，解压得到 database-labs 目录。

需要Docker Engine与Docker Compose，建议至少2核CPU、4GB可用内存和4GB可用磁盘。数据使用虚构订单与保留的.invalid邮箱域。先核对Compose项目和55432端口；若已有同名实验环境，确认数据卷里有哪些成果，再继续使用。

## 1. 启动与连接

在 Bash 中运行，输入专门用于学习的密码，避免使用工作账号密码：

```bash
cd database-labs
read -rsp '输入实验数据库密码: ' LAB_DB_PASSWORD
printf '\n'
export LAB_DB_PASSWORD
docker compose up -d --wait
docker compose exec db psql -X -U lab_admin -d db_lab
```

进入后运行：

```sql
SELECT version(), current_database(), current_user;
SHOW data_directory;
SET TIME ZONE 'UTC';
\dn
\dt shop.*
\d shop.orders
SELECT * FROM shop.products ORDER BY id;
\q
```

`-X` 禁用个人 `psqlrc`，使实验不受本地设置影响。`pg_isready` 只说明服务能接连接，不能证明表、权限和业务数据正确，因此还要运行自检：

```bash
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/02-checks.sql
```

应看到 `baseline checks passed`。若初次初始化失败，先读 `docker compose logs db`，保留日志并修正原因；不要在含有学习成果的数据卷上直接删除重建。初始化脚本只在数据目录为空时执行，修改脚本后重启不会补跑。

连接成功只说明服务在响应，自检再检查七张业务表、金额和流水关系。若以前已经提交过下单，三单基线改变是操作后果，先查记录再判断；不能为让自检变绿而清掉新成果。

如使用图形客户端，连接主机 `127.0.0.1`、端口 `55432`、数据库 `db_lab`、用户 `lab_admin`。图形界面也要核对当前数据库与自动提交状态。

## 2. 实验地图

| 实验 | 运行方式与阅读材料 | 预期证据 |
|---|---|---|
| L1 建表与查询 | [第 3 至 6 章](/notes/database-03-modeling-types)，完成[阶段一题目](/notes/database-exercises) | 查询、预期行数、59700 分的已支付金额 |
| L2 隔离与死锁 | [第 7 章](/notes/database-07-transactions-mvcc)、[第 8 章](/notes/database-08-locks-deadlocks)，开两个 `psql` 会话 | 按步骤记录读取值、等待者和死锁错误 |
| L3 下单与幂等 | 安装 `03-place-order.sql`，运行 `04-order-checks.sql` | 断言通过，失败下单不残留订单 |
| L4 查询性能 | 运行 `05-performance.sql`，阅读[第 12 章](/notes/database-12-query-plans) | 同一查询的索引前后计划与访问块数 |
| L5 权限隔离 | [第 14 章](/notes/database-14-security) | 只读成功、写入与建表失败 |
| L6 逻辑恢复 | [第 15 章](/notes/database-15-backup-restore) | 独立数据库的基线校验和恢复耗时 |
| L7 误删与 PITR | [第 16 章](/notes/database-16-wal-pitr) | 独立恢复实例中恢复点前后标记的差异 |
| L8 发布演练 | [第 20 章](/notes/database-20-migrations)、[综合项目](/notes/database-order-project) | 迁移、回填、锁等待上限、验证与故障处置记录 |

安装下单函数和运行事务自检：

```bash
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/03-place-order.sql
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/04-order-checks.sql
```

安装函数只运行一次。自检会回滚业务写入，可以重复执行；序列编号可能留下空洞，这是正常行为。基线自检也可再次运行。

L2需要独立连接交错，不能把两个会话的SQL顺次贴到同一窗口；L3的单会话自检与双会话竞争也各有用途。L4保留20万行练习表，L5保留角色和视图，L6、L7保留恢复目标，操作结束后这些状态不会都自动消失。

性能实验：

```bash
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/05-performance.sql
```

该脚本创建 `practice.orders_perf` 并保留数据。重复实验前先保存结果，再单独删除这张可再生练习表：

```sql
DROP TABLE practice.orders_perf;
```

## 3. 保存成果和管理环境

把输出、测量和备份放入本地 `.local`，不要提交包含密码或业务数据的备份：

```bash
umask 077
mkdir -p .local
docker compose exec -T db psql -X -U lab_admin -d db_lab -c 'SELECT version();' > .local/version.txt
docker image inspect postgres:16 --format '{{index .RepoDigests 0}}' > .local/image-digest.txt
docker compose stop
docker compose start --wait
```

`stop` 保留容器和数据，`down` 删除容器与网络但保留命名数据卷。不要把 `down -v` 当成日常重启，它会删除示例数据库。示例不提供一键清空命令，防止把重置和启动混用。

配置显式把 `PGDATA` 设为 `/var/lib/postgresql/16/docker`，把命名卷挂在其父目录；这是自定义布局，不是 16 版镜像默认路径。恢复容器使用另一个数据卷。不要自行只改挂载路径，让实际数据落入未管理的匿名卷。

启动、停止与删除存储是三种不同动作。重启保留数据，选择新练习库可以重新开始某项实验；只有明确要丢弃自己可重建的数据时才处理相应存储，不把清空放进默认启动流程。

启动过 L7 恢复容器后，统一使用两份配置管理整个环境，例如 `docker compose -f compose.yaml -f compose.recovery.yaml down`，这样能同时移除两个容器并保留命名数据卷。

新终端需要再次设置 `LAB_DB_PASSWORD`，否则 Compose 会拒绝展开配置。密码变量不改变已有数据库密码，修改角色密码需显式执行 `\password`。

临时环境变量和 Docker 容器元数据可能被本机有权限的用户读取。此配置用于本机实验；生产应采用组织现有的凭据管理、TLS、网络隔离、备份平台和审计体系。

## 4. 记录模板

每个实验保存以下内容：问题与预期、版本和数据规模、完整操作顺序、实际输出、是否满足不变量、失败原因、清理方式。优化实验额外记录硬件、冷热缓存、重复次数和结果中位数；恢复实验额外记录恢复目标、备份时间、恢复点、开始与完成时间。

先写预期再运行，差异才会暴露真正问题。例如预计第二次请求复用订单，就同时核对编号、库存与事件；只看到函数返回一个数，证明范围还不够。记录失败也是成果，保留它比改成一句“已完成”更有助于继续排查。

验证过哪些项目及尚未验证的范围，见[验证记录](/notes/database-lab-results)。

## 单独查看脚本

- [compose.recovery.yaml](/downloads/database-labs/compose.recovery.yaml)
- [compose.yaml](/downloads/database-labs/compose.yaml)
- [sql/00-schema.sql](/downloads/database-labs/sql/00-schema.sql)
- [sql/01-seed.sql](/downloads/database-labs/sql/01-seed.sql)
- [sql/02-checks.sql](/downloads/database-labs/sql/02-checks.sql)
- [sql/03-place-order.sql](/downloads/database-labs/sql/03-place-order.sql)
- [sql/04-order-checks.sql](/downloads/database-labs/sql/04-order-checks.sql)
- [sql/05-performance.sql](/downloads/database-labs/sql/05-performance.sql)
- [sql/06-security-checks.sql](/downloads/database-labs/sql/06-security-checks.sql)

---

[数据库目录](/notes/database-00-learning-guide)
