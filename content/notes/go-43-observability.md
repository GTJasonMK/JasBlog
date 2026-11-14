---
title: "Go 43：日志、指标与 Trace：从异常找到调用链"
date: "2026-11-12"
excerpt: "日志适合看一件具体事件，指标适合看变化趋势，Trace 则能把一条请求的耗时串起来。我会让三者通过请求标识关联，同时控制标签基数和敏感信息。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

日志适合看一件具体事件，指标适合看变化趋势，Trace 则能把一条请求的耗时串起来。我会让三者通过请求标识关联，同时控制标签基数和敏感信息。

## 三类信号

日志记录具体事件及上下文；指标展示随时间变化的计数、延迟和资源使用；trace 记录跨服务调用路径和各段耗时。三者应通过 trace_id、request_id 等字段关联，但不要将高基数字段（如每个用户 ID）作为 Prometheus 标签。

## OpenTelemetry

使用标准 SDK 为 HTTP Server、数据库和 gRPC 调用生成 trace，并按采样策略导出。采样要在故障排查价值、数据量和成本之间平衡。不要在日志和 span 中记录密码、访问令牌或支付敏感信息。

## Prometheus 与 Grafana

暴露请求数、延迟分布、错误率、goroutine 数、连接池等待、Kafka lag 等指标。告警应围绕用户影响和可操作阈值设计，避免对每个短暂波动都告警。

## 动手验证

构造一个抢购请求，沿 trace 找到 HTTP、Redis、Kafka 与数据库各段；再用指标发现消费者积压。

---

[上一篇：Kubernetes 发布：资源、探针和扩缩容](/notes/go-42-kubernetes-production) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：CI/CD：让每次发布有可追溯的结果](/notes/go-44-cicd)

