---
title: "Go 专题 04：配置中心和服务网格：先确认平台还缺什么"
date: "2026-11-12"
excerpt: "引入配置中心或服务网格之前，我会先看 Kubernetes、网关和现有客户端已经覆盖了什么。每多一个组件，都会增加资源、权限和排查工作，需要有具体收益支撑。"
tags: [ "Go", "进阶专题" ]
category: "go-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

引入配置中心或服务网格之前，我会先看 Kubernetes、网关和现有客户端已经覆盖了什么。每多一个组件，都会增加资源、权限和排查工作，需要有具体收益支撑。

## 配置与发现

Kubernetes 已提供 ConfigMap、Secret 和 Service 等基础能力。Nacos、etcd 等外部系统可提供动态配置、注册发现或一致性能力，但增加了依赖与权限管理。先确认平台原生能力不满足的具体需求。

## 服务网格

服务网格可集中处理 mTLS、流量管理和遥测，但会增加代理资源、网络跳数和排障面。需要比较 mesh 与客户端库/网关方案，不能只因“微服务就应该有 mesh”而引入。

## 动手验证

为订单服务列出三项真实需要的服务网格能力，再判断是否能由 Kubernetes、网关或 Go 客户端满足。

---

[上一篇：读写分离与分片：扩展数据库之前先看约束](/notes/go-advanced-03-database-scaling) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：比较 MySQL 与 PostgreSQL，我会看哪些问题](/notes/go-advanced-05-postgresql)

