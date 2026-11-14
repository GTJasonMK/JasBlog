---
title: "Go 29：限时促销项目：先确定接口与订单状态"
date: "2026-11-12"
excerpt: "这个练习从接口和状态开始。先确定谁能下单、订单经过哪些状态、哪些请求允许重试，再写 Handler，后面的数据库和消息设计才有可以对照的规则。"
tags: [ "Go", "促销订单项目" ]
category: "go-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

这个练习从接口和状态开始。先确定谁能下单、订单经过哪些状态、哪些请求允许重试，再写 Handler，后面的数据库和消息设计才有可以对照的规则。

## 功能范围

项目提供用户登录、商品查询、促销活动查询、参与抢购、订单查询、模拟支付和通知。初版是模块化单体，用户、商品、促销、库存和订单各有清楚的包边界；之后再演示拆分服务。

## REST 接口

| 方法与路径 | 用途 |
|---|---|
| POST /api/v1/auth/login | 登录并取得演示用访问令牌 |
| GET /api/v1/products/{id} | 查询商品 |
| GET /api/v1/campaigns/{id} | 查询促销活动 |
| POST /api/v1/campaigns/{id}/claims | 参与抢购；要求认证与幂等键 |
| GET /api/v1/orders/{id} | 查询当前用户自己的订单 |
| POST /api/v1/payments/mock-callback | 模拟支付回调，仅用于本地练习 |
| GET /healthz、GET /readyz | 存活检查与依赖就绪检查 |

用户 ID 应从认证身份中取得，不能相信客户端传入的 user_id。订单查询必须检查资源归属。

## 数据与状态

核心表包括 users、products、campaigns、inventory、orders、order_items 和 idempotency_records。订单状态建议显式定义为 pending_payment、paid、cancelled；所有状态迁移都通过业务函数校验，不能让客户端任意传目标状态。

## 动手验证

画出接口和表的关系图，写出订单状态转换表，并标记哪些写操作需要唯一约束或幂等键。

---

[上一篇：消息可靠性：幂等、重试、Outbox 与补偿](/notes/go-28-message-reliability) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：搭服务骨架：配置、依赖装配与健康检查](/notes/go-30-project-skeleton)

