---
title: "Go 21：MySQL 建模与 SQL：从查询和业务状态出发"
date: "2026-11-12"
excerpt: "设计订单表时，我会先列出要回答的查询，以及必须留下的历史事实。比如成交单价应该跟着订单保存，不能等查询旧订单时再读取商品现在的价格。"
tags: [ "Go", "数据库、缓存与消息" ]
category: "go-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

设计订单表时，我会先列出要回答的查询，以及必须留下的历史事实。比如成交单价应该跟着订单保存，不能等查询旧订单时再读取商品现在的价格。

## 从查询出发建模

先列出需要保存的实体、关系和查询，再决定表。订单有自己的生命周期，应使用独立订单表；订单明细需要保存下单时的商品名称和价格快照，不能只在读取时依赖商品当前价格。

金额用整数保存最小单位，例如分；时间统一约定为 UTC；状态字段使用有限、明确的取值。为外部输入设置 NOT NULL、唯一约束和适当的外键或应用层一致性规则。

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

查询应使用绑定参数，不要把用户输入拼到 SQL 字符串中。SQL 仍要由开发者理解；ORM 不会替你决定事务边界和索引。

## 动手验证

设计促销、商品、库存和订单明细表。写出“查询用户最近 20 个订单”和“查询某促销的可售商品”两条 SQL，并标注需要的字段与索引。

---

[上一篇：认证、授权与 Web 安全的几条边界](/notes/go-20-security) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：索引与查询优化：让执行计划给出依据](/notes/go-22-indexes)

