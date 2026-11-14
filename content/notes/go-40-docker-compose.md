---
title: "Go 40：Docker 与 Compose：把运行环境留下来"
date: "2026-11-12"
excerpt: "构建镜像时，我会同时检查运行身份、证书、CGO 依赖和基础镜像版本。镜像能启动只是第一步，依赖服务、数据卷和重启后的行为还要在 Compose 环境里确认。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

构建镜像时，我会同时检查运行身份、证书、CGO 依赖和基础镜像版本。镜像能启动只是第一步，依赖服务、数据卷和重启后的行为还要在 Compose 环境里确认。

## 多阶段构建

构建镜像时使用固定基础镜像、独立构建阶段和非 root 运行用户。编译参数要兼顾调试信息、安全扫描和目标平台，不要盲目使用会影响性能分析的优化参数。

~~~dockerfile
FROM golang:1.27 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/api"]
~~~

实际项目应根据 TLS 根证书、时区和 CGO 依赖选择运行镜像，并扫描最终镜像。

Dockerfile 中的主版本标签便于阅读示例，但会随补丁版本更新；生产构建应固定 Go 补丁版本和基础镜像 digest，以便复现和审计。

## Compose

Compose 用于本地一起启动 MySQL、Redis、Kafka 和服务，设置持久卷、健康检查、依赖网络和本地环境变量。只在本地开发配置中写演示凭据，确保不会被误用到生产。

## 动手验证

为服务构建非 root 镜像，连接 Compose 启动的 MySQL 和 Redis；验证容器重启后健康检查和数据卷行为。

---

[上一篇：跨服务一致性与数据扩展的代价](/notes/go-39-distributed-data) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：Kubernetes 入门：Pod、Deployment 与流量入口](/notes/go-41-kubernetes-basics)

