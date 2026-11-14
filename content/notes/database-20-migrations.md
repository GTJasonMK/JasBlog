---
title: "数据库 20：从调用方到历史数据，完成一次可核对的迁移"
date: "2026-11-13"
excerpt: "历史行补齐了，新请求却继续写NULL，回填为什么永远跑不完？用来源字段串起调用方更新、分批迁移与约束验证，并明确每一阶段的继续条件。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-operations"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

给订单新增来源字段，历史行补完以后又出现NULL，问题可能在旧版写入入口还在运行。数据迁移不是只扫一遍旧表，还要让新写入遵守新规则。先确认所有调用方，再安排各阶段，才能有真正结束条件。

演示只操作 practice 表，不改变示例下单函数的接口。

## 发布前先追踪影响范围

列出读写该字段的服务、任务、ORM 模型、接口、缓存、事件、报表、CDC、测试和备份恢复。确定旧数据范围、表大小、写入速率、锁要求、复制压力与额外磁盘。没有检查调用方就重命名列，可能使所有旧版本应用立即失败。

已确认可统一更新的开发系统可以直接修改 schema、调用方和测试，并保留创作与业务成果。生产滚动发布涉及不同应用版本时，需要明确的阶段顺序和结束条件，最终收敛到一份实现。

迁移文件应有版本、校验和、执行状态和错误记录。已执行的迁移不要随意改写；恢复执行前核对当前状态，不通过一堆 `IF NOT EXISTS` 把部分失败伪装成完整成功。

同名列已经存在，也可能类型或约束不对；只跳过存在对象会掩盖差异。恢复时检查已经完成的实际状态，只继续未完成部分，保留原数据与记录，而不是从头重放所有写入。

## L8：新增一个必填字段

创建练习表，保留原订单表：

```sql
CREATE TABLE practice.migration_orders AS
SELECT id, status, created_at FROM shop.orders;
ALTER TABLE practice.migration_orders ADD PRIMARY KEY (id);
```

本练习明确把复制的历史虚构订单定义为来自 `web`。真实数据若来源未知，不允许为了通过非空约束虚构历史。

web在这里是实验定义，能够被独立核对。真实历史没有来源证据时，应该建模未知或先补资料，不能由程序随便填一个常见值，再把非空检查通过当作数据准确。

### 第一步：增加可空列

```sql
BEGIN;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
ALTER TABLE practice.migration_orders ADD COLUMN source_channel text;
COMMIT;
```

即使是元数据级改动也需要取得表锁。先演练被旧事务阻塞时能否及时失败，避免发布任务无限等待。应用必须先更新为对新写入提供合法来源；本练习没有运行应用，实际发布需要独立验证写调用方。

### 第二步：分批回填，按实际状态续跑

```sql
BEGIN;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
WITH batch AS (
    SELECT id FROM practice.migration_orders
    WHERE source_channel IS NULL ORDER BY id LIMIT 1000 FOR UPDATE
)
UPDATE practice.migration_orders o SET source_channel = 'web'
FROM batch b WHERE o.id = b.id
RETURNING o.id, o.source_channel;
COMMIT;
```

每批提交，保存完成行数与耗时。中断后只处理仍为空的行；某批失败应回滚并说明原因。大表需要监控 WAL、复制延迟和死元组，按实际压力调整批量与节奏。

持续有新空值说明写入入口没更新，不能只反复跑回填来掩盖。最终核对所有范围与异常值，不能把“最后一批零行”当成全部数据正确的唯一证据。

按NULL筛选让已完成行不重复写，批次提交保存进度。若回填规则后来改变，还要记录规则或输入版本，重新识别受影响行；仅凭不为空，无法证明旧版本成果符合新要求。

### 第三步：约束新数据并验证历史

```sql
ALTER TABLE practice.migration_orders
    ADD CONSTRAINT migration_orders_channel_values
    CHECK (source_channel IN ('web', 'mobile')) NOT VALID;
ALTER TABLE practice.migration_orders
    ADD CONSTRAINT migration_orders_channel_present
    CHECK (source_channel IS NOT NULL) NOT VALID;
ALTER TABLE practice.migration_orders
    VALIDATE CONSTRAINT migration_orders_channel_values;
ALTER TABLE practice.migration_orders
    VALIDATE CONSTRAINT migration_orders_channel_present;
```

`NOT VALID` 推迟对已有行的全量验证，仍会约束新插入或更新的行。验证阶段仍消耗 I/O 并有相应锁，具体持续时间要测量。最后在有锁等待上限的短事务中设置 `NOT NULL`，再删除辅助非空 CHECK：

```sql
BEGIN;
SET LOCAL lock_timeout = '2s';
ALTER TABLE practice.migration_orders ALTER COLUMN source_channel SET NOT NULL;
ALTER TABLE practice.migration_orders DROP CONSTRAINT migration_orders_channel_present;
COMMIT;
```

保留合法值 CHECK。验证新行缺字段、非法来源均失败，合法数据成功。需要索引时单独评估，`CREATE INDEX CONCURRENTLY` 不能放入上述事务块。

NOT VALID把已有数据的全量验证推迟，却从现在开始约束新写入，正好把历史检查与新增保护分开。验证完成后收紧NOT NULL，最后删除辅助约束，阶段结束就回到一份明确合同，不长期留下新旧双写路径。

## 批量改数据要保存原值

确认数据库、身份、审批对象和候选行；记录主键与旧值；核对候选数量；设定等待和执行预算；使用带旧值条件的更新；比较 `RETURNING` 与预期；核对业务不变量，再提交。

需要撤销已提交变更时，原值记录是恢复依据。反向 SQL 同样要核对当前值，防止覆盖之后的合法修改。删除列、类型收窄和批量删除通常有数据损失，应用回滚并不能自动把数据找回来。

更新后又被正常业务修改的行，不应被简单反向脚本覆盖。恢复和正向变更都要带当前条件与身份，保存冲突供核对，不能为了让回滚数字凑齐而抹掉后续成果。

## 导入与数据清洗

CSV 先导入 staging 表，显式规定编码、列、分隔符、日期和空值语义，再做类型、唯一键、引用和金额校验。失败数据保留原因，不要用 `ON CONFLICT DO NOTHING` 丢掉所有不符合预期的记录后宣布成功。

`COPY` 读取服务端路径，`\copy` 读取客户端路径。示例通常用 `\copy`；生产导入权限、文件来源、数据范围和导入审计要明确。大量写入后核对约束与统计。

## 动手验证

提交含影响范围、候选量、SQL、预算、检查、恢复依据和观察窗口的变更单。演示回填中断后续跑、DDL 锁超时和非法新值被拒绝。参考[操作手册](/notes/database-runbooks)。

参考：[ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html)、[COPY](https://www.postgresql.org/docs/16/sql-copy.html)。

---

[上一篇：用等待链、计划和存储证据定位故障](/notes/database-19-troubleshooting) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：把 PostgreSQL 的经验迁到 MySQL 时，要重查哪些行为](/notes/database-21-mysql)
