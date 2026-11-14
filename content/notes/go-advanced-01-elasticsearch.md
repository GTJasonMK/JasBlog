---
title: "Go 专题 01：Elasticsearch：把搜索当作可重建的投影"
date: "2026-11-12"
excerpt: "商品搜索可以容忍短暂延迟，结算价格却不能照抄搜索结果。我会把搜索索引当作可以重建的查询视图，先明确它和主数据之间的关系，再讨论检索能力。"
tags: [ "Go", "进阶专题" ]
category: "go-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

商品搜索可以容忍短暂延迟，结算价格却不能照抄搜索结果。我会把搜索索引当作可以重建的查询视图，先明确它和主数据之间的关系，再讨论检索能力。

## 何时需要

MySQL 的结构化查询通常足以满足订单和商品的基础过滤。需要全文检索、相关度排序、复杂聚合或大规模搜索时，可评估 Elasticsearch。引入前要明确更新延迟、集群运维和索引成本。

## 数据同步

Elasticsearch 通常是可重建的搜索投影，不是订单主数据。通过 Outbox 或 CDC 同步事件，索引更新应幂等；删除、重试和重建索引都要有明确流程。搜索结果可以短暂陈旧，结算时仍从权威数据库读取价格和库存。

## 动手验证

为商品搜索定义索引字段和更新事件，说明搜索索引延迟时如何保证下单使用的仍是可信商品状态。

---

[上一篇：生产排障：先确认影响，再定位原因](/notes/go-45-operations) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：RabbitMQ 与 Kafka：从消息要怎么用来选型](/notes/go-advanced-02-messaging-choice)

