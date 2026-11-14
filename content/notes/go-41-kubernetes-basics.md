---
title: "Go 41：Kubernetes 入门：Pod、Deployment 与流量入口"
date: "2026-11-12"
excerpt: "Pod被删除以后出现了一个新Pod，访问地址却没变，是谁在维护它们？沿Deployment、Service与探针追踪一个应用副本，区分重建、接流量和外部路由。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

直接运行一个容器，退出后需要有人决定是否重启；希望始终有两个副本，又需要持续观察实际数量。Kubernetes把这些期望写进对象，由控制器不断把当前状态向期望状态调整。它管理的是运行与调度，不理解订单是否扣错库存。

## 核心对象

Pod 是调度单位，Deployment 管理副本和滚动更新，Service 提供稳定的集群网络入口，Ingress 或 Gateway API 管理外部 HTTP 路由。ConfigMap 提供非机密配置，Secret 管理敏感值入口，但需要集群侧访问控制和加密配置。

服务 Deployment 应指定镜像版本、端口、资源请求与限制，以及存活/就绪探针。就绪探针失败时 Pod 不接流量；存活探针失败时 Kubernetes 可能重启容器。错误的探针可能造成重启风暴或流量打到未就绪服务。

Pod可以包含共享网络和部分资源的多个容器，是调度中的基本单位。Deployment通过ReplicaSet维护副本与滚动版本，删除某个Pod后会创建替代者；新Pod的IP可能变化，所以客户端不能永久记住一个Pod地址。

Service根据selector选择相应Pod，并提供稳定的服务发现与转发入口。标签写错可能导致没有后端，即使Pod本身正常；容器端口、Service目标端口与实际监听端口也必须一致。Service对象不会自动创建应用进程。

Ingress需要相应控制器，Gateway API也依赖具体实现，提交资源声明不代表已经有外部负载均衡器。外部域名、TLS证书与流量入口由平台配置，先用集群内Service验证路径，再接外部入口更容易定位问题。

## 三种探针分别回答什么

startupProbe给启动较慢的程序时间，在它成功前抑制存活与就绪探测；readiness决定是否进入正常服务端点；liveness用于判断是否需要重启。健康接口和探针阈值必须与应用实际状态对应，不能一个200同时冒充三种语义。

依赖数据库短暂不可用，不一定意味着进程需要重启；若所有实例都因共享依赖失败被重启，只会增加恢复压力。启动、健康和容量的判断要分别安排，并观察失败后是否真的改善。

## 本地验证

可选择 kind 或 minikube。先部署依赖，再部署应用，通过 Service 做集群内访问；使用端口转发仅用于本地调试。生产集群与本地集群的存储、网络和安全策略不同，不能凭本地成功就推断生产配置正确。

验证时先查看Pod状态与事件，再看容器日志与Service端点。Pending通常要找调度或卷条件，CrashLoopBackOff要看退出原因，Running却没有流量则继续检查就绪、标签和端口。让每一步解释一个观察，比反复重建全部资源更有效。

## 动手验证

编写一个 Deployment 和 Service，使两个应用副本接收流量；给出 readinessProbe 和 startupProbe 的作用差异。

---

[上一篇：Docker 与 Compose：把运行环境留下来](/notes/go-40-docker-compose) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：Kubernetes 发布：资源、探针和扩缩容](/notes/go-42-kubernetes-production)

