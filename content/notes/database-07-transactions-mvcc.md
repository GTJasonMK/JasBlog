---
title: "数据库 07：快照稳定了，业务规则就一定正确吗"
date: "2026-11-13"
excerpt: "两名医生都确认还有别人值班，各自离开，最后却无人值班。用两个连接的交错过程解释稳定快照为何仍可能发生写偏斜，以及Serializable失败后该重试什么。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-transactions"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

两名医生各自看到两人在值班，于是都把自己改成离开。他们读到的快照稳定，修改的也不是同一行，最后却没有任何人值班。隔离级别要从实际允许的过程理解，不能只凭名字推断业务一定安全。

并发实验需要两个独立连接，单会话顺序执行无法证明并发行为。

## 事务保护一个完整业务动作

事务先把必须共同成立的变化圈成一个提交单位。原子性负责一起提交或撤销，隔离性限制并发观察，持久性依赖日志与存储；“至少一人值班”这项一致性仍需要规则进入约束或事务设计。数据库不会从两行boolean猜到排班政策。

```sql
BEGIN;
SELECT current_setting('transaction_isolation');
SAVEPOINT before_change;
UPDATE shop.products SET price_cents = 20900 WHERE id = 1;
ROLLBACK TO SAVEPOINT before_change;
COMMIT;
```

保存点允许撤销局部操作，但不能用来吞掉未知错误继续成功返回。PostgreSQL 事务中语句报错后，后续语句通常会收到“事务已中止”，必须回滚到错误之前的保存点或回滚整个事务。

示例先改价再回到保存点，最后提交的是撤销后的状态。保存点没有把外部邮件、支付或已经返回给用户的结果一并倒带，事务原子边界仍然只覆盖它实际管理的数据库变化。

## MVCC 决定你看到哪个版本

普通读取根据快照判断可见行，通常不阻塞普通写入。写写冲突仍要等待锁。长事务持有老快照，可能阻碍旧版本回收并造成膨胀。不要把“读取不阻塞写入”理解成数据库没有锁。

| PostgreSQL 隔离级别 | 普通读取的快照 | 必须理解的限制 |
|---|---|---|
| Read Uncommitted | 按 Read Committed 实现 | PG 不提供真正的脏读模式 |
| Read Committed，默认 | 通常每条语句重新取得快照 | 同一事务两次查询可看到不同已提交值 |
| Repeatable Read | 首次需要快照时确定事务快照 | PG 可避免幻读，仍可能发生写偏斜 |
| Serializable | 使用可串行化快照隔离检查依赖 | 可能以 `40001` 终止事务，应用须完整重试 |

这里描述的是 PostgreSQL 实现，不是所有数据库的通用行为表。锁定读取和写入还涉及锁等待与更新后的条件重检。

Read Committed的两次SELECT可能取得不同快照；Repeatable Read把普通读保持在事务快照上，却不意味着它自动锁住所有读过的业务条件。先区分看见什么，再问允许提交什么，这两个问题不能合成一个“隔离更强所以都没问题”。

## 实验一：两次读取为什么不同

管理员先创建专用练习数据，不修改订单基线：

```sql
CREATE TABLE practice.isolation_demo (
    id integer PRIMARY KEY, balance integer NOT NULL CHECK (balance >= 0)
);
INSERT INTO practice.isolation_demo VALUES (1, 100), (2, 100);
```

严格按表格顺序执行，每格是一条会话操作：

| 顺序 | 会话 A | 会话 B |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | |
| 2 | `SELECT balance FROM practice.isolation_demo WHERE id=1;` 得到 100 | |
| 3 | | `UPDATE practice.isolation_demo SET balance=200 WHERE id=1;` 自动提交 |
| 4 | 再查同一行，得到 200 | |
| 5 | `ROLLBACK;` | |

再次执行，把第 1 步改为 `BEGIN ISOLATION LEVEL REPEATABLE READ`，B 将余额改为 300。A 两次都看到 200，结束事务后新查询才看到 300。保存每一步的输出与隔离级别。

第二轮开始时余额已经是200，所以不是再次期待100。实验保留前一次提交状态，预测输出时先核对前置数据；否则把错误的起点当答案，会误判隔离行为。

## 实验二：稳定快照仍可能破坏跨行规则

业务要求两名医生至少一人值班：

```sql
CREATE TABLE practice.on_call (id integer PRIMARY KEY, available boolean NOT NULL);
INSERT INTO practice.on_call VALUES (1, true), (2, true);
```

1. A、B 都以 Repeatable Read 开启事务，各自执行 `SELECT count(*) FROM practice.on_call WHERE available`，都得到 2。
2. A 将 `id=1` 改为 `false`，B 将 `id=2` 改为 `false`。修改的是不同的行。
3. 两边提交，最终无人值班。这就是写偏斜，单行非空约束和稳定快照无法保护该规则。
4. 先恢复两行 `available=true`，改用 Serializable 并重复同样交错，应有一个事务以 `40001` 失败。失败方回滚整个事务，再重试时必须重新检查人数。

另一种方案是所有相关事务锁定同一条排班控制记录，串行维护该不变量。选择取决于竞争程度和事务范围，不能只把隔离级别名字写进设计文档。

Serializable发现无法等价为某个串行顺序时，可以让一方失败。重试时重新读取人数，才能发现另一人已离开；只把最后的UPDATE重发，会继续使用过期判断。较强隔离把某些错误变成可检测失败，应用还要完成正确恢复。

## 动手验证

解释脏读、不可重复读、幻读、写偏斜分别对应什么现象。提交两个实验的时间顺序和结果，说明为什么重试最后一条 `UPDATE` 不能替代重试整个事务。

参考：[官方隔离级别说明](https://www.postgresql.org/docs/16/transaction-iso.html)。

---

[上一篇：用窗口函数做排名、累计和报表](/notes/database-06-windows-reports) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：找到谁在等谁，再处理锁和死锁](/notes/database-08-locks-deadlocks)
