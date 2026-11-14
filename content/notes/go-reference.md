---
title: "Go 后端资料索引与术语"
date: "2026-11-11"
excerpt: "语言和组件的行为与具体版本有关。我把常用官方资料集中在这里，查接口、确认事务或部署约束时，可以沿这些入口继续读。"
tags: [ "Go" ]
category: "go"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-11
---

语言和组件的行为与具体版本有关。我把常用官方资料集中在这里，查接口、确认事务或部署约束时，可以沿这些入口继续读。

## Go 与 Web

- [Go 官方文档](https://go.dev/doc/)
- [Go 官方发布与下载页](https://go.dev/dl/)
- [Go 1.22 发布说明：循环变量语义](https://go.dev/doc/go1.22)
- [A Tour of Go](https://go.dev/tour/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Go 标准库文档](https://pkg.go.dev/std)
- [net/http Server](https://pkg.go.dev/net/http#Server)
- [golang.org/x/sync/errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup)
- [Gin 官方文档](https://gin-gonic.com/docs/)
- [Go database/sql](https://pkg.go.dev/database/sql)

## 数据与消息

- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [GORM 官方文档](https://gorm.io/docs/)
- [Redis 文档](https://redis.io/docs/latest/)
- [Redis Cluster 规范](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)
- [Redis Streams 文档](https://redis.io/docs/latest/develop/data-types/streams/)
- [Apache Kafka 文档](https://kafka.apache.org/documentation/)
- [gRPC 文档](https://grpc.io/docs/)
- [Protocol Buffers 文档](https://protobuf.dev/)

## 容器与可观测性

- [Docker 文档](https://docs.docker.com/)
- [Kubernetes 文档](https://kubernetes.io/docs/home/)
- [Helm 文档](https://helm.sh/docs/)
- [OpenTelemetry 文档](https://opentelemetry.io/docs/)
- [Prometheus 文档](https://prometheus.io/docs/)
- [Grafana 文档](https://grafana.com/docs/)

## 术语

| 术语 | 含义 |
|---|---|
| 幂等 | 同一操作重复执行不会造成重复业务效果 |
| P95/P99 | 延迟分布中 95%/99% 请求不超过的时间 |
| Outbox | 在业务数据库事务内记录待发布事件，再异步送入消息系统 |
| 死信 | 多次处理失败后转入隔离队列、等待排查的消息 |
| 背压 | 下游或系统过载时限制上游生产速度 |
| 最终一致性 | 数据经过一段传播时间后达到一致，中间允许暂时不一致 |
| SLO | 面向用户定义的服务可靠性目标 |

版本提示：依赖、数据库和 Kubernetes 行为会随版本变化。开始项目实现时，应读取各组件官方兼容矩阵，固定明确版本，再运行章节中的示例和验证流程。

