---
title: "Go 41：Kubernetes 入门：Pod、Deployment 与流量入口"
date: "2026-11-12"
excerpt: "我理解 Kubernetes 时，会先跟着一个应用副本看它怎样被创建、怎样收到流量。Deployment 管副本，Service 提供入口，探针决定何时接流量或重启，职责并不相同。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我理解 Kubernetes 时，会先跟着一个应用副本看它怎样被创建、怎样收到流量。Deployment 管副本，Service 提供入口，探针决定何时接流量或重启，职责并不相同。

## 核心对象

Pod 是调度单位，Deployment 管理副本和滚动更新，Service 提供稳定的集群网络入口，Ingress 或 Gateway API 管理外部 HTTP 路由。ConfigMap 提供非机密配置，Secret 管理敏感值入口，但需要集群侧访问控制和加密配置。

服务 Deployment 应指定镜像版本、端口、资源请求与限制，以及存活/就绪探针。就绪探针失败时 Pod 不接流量；存活探针失败时 Kubernetes 可能重启容器。错误的探针可能造成重启风暴或流量打到未就绪服务。

## 本地验证

可选择 kind 或 minikube。先部署依赖，再部署应用，通过 Service 做集群内访问；使用端口转发仅用于本地调试。生产集群与本地集群的存储、网络和安全策略不同，不能凭本地成功就推断生产配置正确。

## 动手验证

编写一个 Deployment 和 Service，使两个应用副本接收流量；给出 readinessProbe 和 startupProbe 的作用差异。

---

[上一篇：Docker 与 Compose：把运行环境留下来](/notes/go-40-docker-compose) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：Kubernetes 发布：资源、探针和扩缩容](/notes/go-42-kubernetes-production)

