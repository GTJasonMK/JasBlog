---
title: "Go 专题 05：比较 MySQL 与 PostgreSQL，我会看哪些问题"
date: "2026-11-12"
excerpt: "比较数据库时，我更愿意拿出实际查询、数据类型和运维要求逐项看。一个脱离版本和数据分布的性能数字，很难回答当前项目应该选哪一个。"
tags: [ "Go", "进阶专题" ]
category: "go-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

比较数据库时，我更愿意拿出实际查询、数据类型和运维要求逐项看。一个脱离版本和数据分布的性能数字，很难回答当前项目应该选哪一个。

## 比较方式

MySQL 与 PostgreSQL 都是成熟关系数据库。按团队熟悉度、SQL 功能、扩展机制、JSON 需求、索引类型、云平台支持和运维能力比较，不以单一性能数字决定。

PostgreSQL 常见能力包括丰富的数据类型、表达式/部分索引、扩展和强大的 SQL 功能；MySQL 在许多 Web 服务中部署广泛且生态成熟。具体版本、隔离行为和驱动支持要以官方文档与实测为准。

## 动手验证

将一条这些笔记中的订单与库存查询分别在 MySQL、PostgreSQL 上实现，比较执行计划、迁移和连接池配置差异。

---

[上一篇：配置中心和服务网格：先确认平台还缺什么](/notes/go-advanced-04-service-discovery-mesh) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：请求慢在哪里：DNS、TCP、TLS 与 Linux 网络](/notes/go-advanced-06-networking-linux)

