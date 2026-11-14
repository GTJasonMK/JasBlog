---
title: "数据库 09：让订单、库存、幂等和流水一起成立"
date: "2026-11-13"
excerpt: "一次下单要同时留下订单、明细、库存变化和待发送事件。我用同一笔单商品订单串起这些规则，重点看重复请求和中途失败时，哪些记录必须一起提交、一起撤销。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-transactions"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

一次下单要同时留下订单、明细、库存变化和待发送事件。我用同一笔单商品订单串起这些规则，重点看重复请求和中途失败时，哪些记录必须一起提交、一起撤销。

完整实现集中在[下单函数](/downloads/database-labs/sql/03-place-order.sql)，下面沿它的执行顺序解释不变量与失败行为。

## 先写不变量

每次单商品下单需要同时满足：库存不为负；一个客户的同一请求键最多一个订单；同一请求键不能换商品或数量；订单金额等于购买时单价乘数量；扣库存流水、明细和待发送事件与订单一起提交。任何一步失败，整个事务回滚。

示例函数仅处理单商品、单币种、无优惠的创建订单，不包含支付调用、取消、退款或发货。增加这些业务前先补状态机、不变量和测试。

应用接入时，客户身份必须由认证与授权结果确定，不能信任请求体随意提供的 `customer_id`。本函数维护数据和事务规则，不实现用户登录与租户授权。

按[实验手册](/notes/database-lab-guide)安装函数并运行自检，然后在 `psql` 里尝试：

```sql
BEGIN;
SELECT shop.place_order(1, 1, 2, 'learn-order-001');
SELECT shop.place_order(1, 1, 2, 'learn-order-001');
SELECT id, total_cents FROM shop.orders WHERE request_key = 'learn-order-001';
ROLLBACK;
```

两次返回同一个 id，事务内只出现一个订单，最后恢复业务基线。序列可能递增，不要求编号连续。

## 函数为什么先争取请求身份

函数先向订单唯一键插入。冲突方等待竞争事务结束，随后复用已存在的订单，并比较内容指纹。示例指纹只是明确编码的 `product_id:quantity`，它覆盖本函数全部影响结果的请求字段；扩展请求字段后必须同步更新规范化与比较逻辑。

`ON CONFLICT DO NOTHING` 只处理预期的唯一键冲突，其他错误继续抛出。它不表示所有请求都成功。如果对方回滚，本次插入可继续；如果对方提交，在 Read Committed 下后续语句取得的新快照能查到订单。

函数随后执行带 `stock >= quantity` 条件的原子扣减，再写明细、金额、库存流水和 outbox。缺货异常会撤销前面刚插入的订单。函数在调用者事务内执行，外层若继续出错，前面的函数结果也不会独立提交。

Repeatable Read 或 Serializable 下可能出现 `40001`，需要重试整个事务。高层代码不能捕获所有异常后返回旧成功值。

## 双会话验收

先用 A 开启事务并调用 `place_order(1,1,1,'race-001')`，暂不结束；B 开启事务调用完全相同请求，应等待。A 提交后 B 返回同一 id，B 提交。检查库存只减少一次、只写一个订单和一条扣减流水。

这次实验会提交业务变化，应在完整备份后执行，记录自己的原始库存；之后不要要求基线仍是 3 单。也可使用综合项目单独创建的客户和商品作为测试夹具。

再用同一请求键、不同数量调用，应得到 `22023`。针对零库存商品调用应失败且没有残留订单。脚本 `04-order-checks.sql` 已包含单会话断言，并回滚其写入。

## 外部支付无法加入本地数据库原子提交

数据库提交和支付网关调用是两个系统。不能靠一个本地事务保证“网关扣款和数据库记录绝对同时成功”。使用稳定支付请求号、网关幂等接口、状态机、回调去重与对账处理不确定结果。

本地 outbox 将“订单存在”和“需要发送事件”一起提交。后台工作者发送后再标记交付；若发送成功后进程在标记前崩溃，事件会再次发送。消费者需要用稳定事件 id 去重。交付语义通常至少一次，需要业务幂等才能避免重复效果。

## 对账是发现偏差，不是掩盖错误

```sql
SELECT p.id, p.stock, coalesce(m.balance, 0) AS ledger_stock
FROM shop.products p
LEFT JOIN (
    SELECT product_id, sum(delta) AS balance
    FROM shop.stock_movements GROUP BY product_id
) m ON m.product_id = p.id
WHERE p.stock <> coalesce(m.balance, 0);
```

期望返回零行。发现不符时先保存证据，确认哪一方是可信事实，再做有审计的修复；不要直接把流水合计覆盖库存。支付对账还要比对网关账单、成功金额和状态，不能只比较记录数。

## 动手验证

解释超时后为何应使用原请求键查询或重试。设计取消订单的条件状态转换，确保重复取消只返还一次库存；这里只提交设计和测试序列，综合项目再实现。

参考：[INSERT 与冲突处理](https://www.postgresql.org/docs/16/sql-insert.html)。

---

[上一篇：找到谁在等谁，再处理锁和死锁](/notes/database-08-locks-deadlocks) · [数据库目录](/notes/database-00-learning-guide) · [下一篇：事务接到应用里，还要管连接、超时和重试](/notes/database-10-connections-application)
