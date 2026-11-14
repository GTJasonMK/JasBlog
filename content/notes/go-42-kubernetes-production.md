---
title: "Go 42：Kubernetes 发布：资源、探针和扩缩容"
date: "2026-11-12"
excerpt: "增加 Pod 不一定能增加系统容量。如果数据库连接已经耗尽，新副本反而会让等待更严重。我会把应用资源、下游预算和滚动退出一起检查。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

增加 Pod 不一定能增加系统容量。如果数据库连接已经耗尽，新副本反而会让等待更严重。我会把应用资源、下游预算和滚动退出一起检查。

## 配置和安全

镜像以不可变标签或 digest 部署，配置通过 ConfigMap/Secret 或外部密钥系统注入。使用最小权限 ServiceAccount、NetworkPolicy 和容器安全上下文；避免 privileged、宿主机网络和不必要的挂载。

## 资源与探针

根据压测设置 CPU、内存 requests/limits。内存限制过低会触发 OOMKilled；CPU 限制过紧会产生节流。探针只反映服务健康，不应在短暂依赖故障时让所有副本反复重启。

## 发布与扩缩容

Deployment 滚动更新需配合 maxSurge/maxUnavailable 和优雅退出。HPA 可按 CPU 或自定义指标扩容，但如果数据库连接、Redis 或 Kafka 消费能力先到上限，增加 Pod 只会放大下游压力。Helm values 应按环境拆分且不保存明文凭据。

## 回滚

回滚应用镜像不一定能回滚数据库结构。部署必须与兼容迁移配套，发布前检查数据库变更是否支持新旧版本共存。

## 动手验证

模拟一个版本滚动更新，观察 readiness、请求错误率和旧 Pod 退出过程；随后回滚应用版本。

---

[上一篇：Kubernetes 入门：Pod、Deployment 与流量入口](/notes/go-41-kubernetes-basics) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：日志、指标与 Trace：从异常找到调用链](/notes/go-43-observability)

