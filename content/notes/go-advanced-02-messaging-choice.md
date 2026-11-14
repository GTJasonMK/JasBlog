---
title: "Go 专题 02：RabbitMQ 与 Kafka：从消息要怎么用来选型"
date: "2026-11-12"
excerpt: "选择消息队列时，我会先列出是否需要回放、顺序和复杂路由，再比较吞吐与维护成本。名称和流行程度都不能替业务决定消息的确认、重试和幂等规则。"
tags: [ "Go", "进阶专题" ]
category: "go-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

选择消息队列时，我会先列出是否需要回放、顺序和复杂路由，再比较吞吐与维护成本。名称和流行程度都不能替业务决定消息的确认、重试和幂等规则。

## 选型维度

比较吞吐、保留和回放能力、路由模式、顺序范围、消费模型、运维复杂度、生态和团队经验。Kafka 擅长持久化事件流、分区扩展与回放；RabbitMQ 擅长灵活路由和传统工作队列语义。具体能力还取决于拓扑、持久化和确认配置。

## 设计重点

无论选择哪种队列，都要说明投递确认、消费者确认、重试、死信、幂等和监控。换队列不能替代业务事件设计和失败补偿。

## 动手验证

为“订单事件回放”和“定向通知路由”分别比较 Kafka 与 RabbitMQ，并写出选择依据。

---

[上一篇：Elasticsearch：把搜索当作可重建的投影](/notes/go-advanced-01-elasticsearch) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：读写分离与分片：扩展数据库之前先看约束](/notes/go-advanced-03-database-scaling)

