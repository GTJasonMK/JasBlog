---
title: "Go 21：MySQL 建模与 SQL：从查询和业务状态出发"
date: "2026-11-12"
excerpt: "商品改价以后，旧订单的金额为什么不能跟着变化？从成交事实与当前资料的区别设计表，再把用户最近订单查询落到字段、排序和约束上。"
tags: [ "Go", "数据库、缓存与消息" ]
category: "go-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

商品昨天卖100元，今天改成120元，查看昨天订单时应该显示多少？若订单只存商品编号，查询时再取商品当前价格，历史就被今天的数据改写了。建表前先确认要保存的是当前资料还是已经发生的事实。

## 从查询出发建模

先列出需要保存的实体、关系和查询，再决定表。订单有自己的生命周期，应使用独立订单表；订单明细需要保存下单时的商品名称和价格快照，不能只在读取时依赖商品当前价格。

金额用整数保存最小单位，例如分；时间统一约定为 UTC；状态字段使用有限、明确的取值。为外部输入设置 NOT NULL、唯一约束和适当的外键或应用层一致性规则。

订单主表保存用户、状态和总额，明细保存成交商品、数量与成交单价。商品名称和价格可以作为快照，商品编号仍用于追溯原资料。快照的重复是为了保留事实，不是任意复制一份会随时同步的主数据。

下面只是主表起点。created_at记录何时创建，不兼任支付时间；金额单位与时区在整个连接和接口中保持一致：

~~~sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  status VARCHAR(24) NOT NULL,
  total_amount BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_orders_user_created (user_id, created_at)
);
~~~

## SQL 与参数化

查询用户最近20个订单，可以使用：

~~~sql
SELECT id, status, total_amount, created_at
FROM orders
WHERE user_id = ?
ORDER BY created_at DESC, id DESC
LIMIT 20;
~~~

相同时间用id继续排序，结果次序才明确。示例索引以user_id开头，再接created_at；InnoDB二级索引还包含主键信息，但最终是否避免排序仍需看实际版本与执行计划。不要只看到字段都出现在索引里就假定访问路径一定最优。

查询应使用绑定参数，不要把用户输入拼到 SQL 字符串中。SQL 仍要由开发者理解；ORM 不会替你决定事务边界和索引。

NOT NULL只能拒绝空值，不能保证金额非负；唯一约束拒绝相同业务键，不能解释每个状态能怎样变化。数据约束负责可由表维护的不变量，业务代码负责状态转换、权限和跨表流程，不能把两者互相当作省略理由。

Go的database/sql中，查询一行后处理ErrNoRows，查询多行后关闭Rows并检查Rows.Err。数据库返回的NULL要用可空表示接住，不能直接当成空字符串或0；“未知支付时间”与“某个零时刻”在含义上不同。

先把用户订单、活动商品与库存更新写成明确SQL，再决定表是否支持这些访问。若查询经常靠扫描大JSON字段猜状态，可能需要调整模型；若为了未来未知查询预先加几十个索引，则先承担了全部写入和维护成本。

## 动手验证

设计促销、商品、库存和订单明细表。写出“查询用户最近 20 个订单”和“查询某促销的可售商品”两条 SQL，并标注需要的字段与索引。

---

[上一篇：认证、授权与 Web 安全的几条边界](/notes/go-20-security) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：索引与查询优化：让执行计划给出依据](/notes/go-22-indexes)

