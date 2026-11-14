---
title: "Go 40：Docker 与 Compose：把运行环境留下来"
date: "2026-11-12"
excerpt: "程序在构建阶段编译成功，放进最小镜像却启动不了，缺了什么？沿多阶段构建说明运行时文件、CGO、证书与身份，再看Compose如何保留依赖环境。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Go程序可以编成一个可执行文件，但运行时仍可能需要系统库、根证书、时区或配置。构建阶段成功，只说明编译条件满足；把文件放进极小镜像后不能访问HTTPS，也可能只是缺少信任根，而非业务请求写错。

## 多阶段构建

构建镜像时使用固定基础镜像、独立构建阶段和非 root 运行用户。编译参数要兼顾调试信息、安全扫描和目标平台，不要盲目使用会影响性能分析的优化参数。

下面假定项目有go.mod、go.sum与cmd/api入口。先复制依赖声明再下载，有利于源码修改时复用依赖层；之后才复制源码编译。最终镜像只取运行产物，减少无关工具与文件：

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

`CGO_ENABLED=0` 适合依赖允许纯Go构建的程序，不是任意项目的通用开关。使用C库或相应驱动时，应明确动态库、libc与目标架构。构建x86文件放到ARM机器，也不会因为使用容器就自动变成可执行格式。

非root运行限制默认权限，但写日志或上传目录仍需合适权限与挂载。日志通常写标准输出，持久数据放受控卷，不写进容器临时层。EXPOSE是端口说明，不会自动把服务映射到宿主机；外部访问还需要端口发布或编排网络。

Dockerfile 中的主版本标签便于阅读示例，但会随补丁版本更新；生产构建应固定 Go 补丁版本和基础镜像 digest，以便复现和审计。

## Compose

Compose 用于本地一起启动 MySQL、Redis、Kafka 和服务，设置持久卷、健康检查、依赖网络和本地环境变量。只在本地开发配置中写演示凭据，确保不会被误用到生产。

容器里的localhost指自己，不是宿主机或另一个数据库容器。应用连接同一Compose网络的数据库时使用服务名；数据库通常不必向所有宿主机网卡公开端口。启动顺序也不等于就绪，应用仍要在限定时间内处理依赖尚未可用的情况。

持久卷让数据库重建容器后保留数据，但不是备份。删除卷可能直接删除学习数据，恢复练习要使用专门环境并确认范围；镜像升级前还要核对数据库版本与数据目录兼容性。

验证镜像时分别检查进程身份、健康请求、HTTPS调用和SIGTERM退出。Compose测试还包括数据库重启、应用重新连接与数据仍可查询。Dockerfile只是可复用的构建思路，实际源码路径、依赖版本与运行行为必须在项目里逐项核对。

## 动手验证

为服务构建非 root 镜像，连接 Compose 启动的 MySQL 和 Redis；验证容器重启后健康检查和数据卷行为。

---

[上一篇：跨服务一致性与数据扩展的代价](/notes/go-39-distributed-data) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：Kubernetes 入门：Pod、Deployment 与流量入口](/notes/go-41-kubernetes-basics)

