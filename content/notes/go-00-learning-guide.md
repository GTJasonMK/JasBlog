---
title: "Go 学习笔记：目录与阅读路线"
date: "2026-11-12"
excerpt: "这组 Go 笔记围绕后端请求怎样被处理来展开：先写清语言和并发，再接住 HTTP 请求，最后把业务结果可靠地留在数据库里。缓存、消息队列和容器都放回这条链路中解释。"
tags: [ "Go" ]
category: "go"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

这组 Go 笔记围绕后端请求怎样被处理来展开：先写清语言和并发，再接住 HTTP 请求，最后把业务结果可靠地留在数据库里。缓存、消息队列和容器都放回这条链路中解释。

我会先把模块化单体跑通，再讨论异步下单和服务拆分。示例中的限时促销订单系统用于串联知识点，重点是库存、订单状态、幂等和失败恢复，不假定这些片段已经组成一套可直接上线的系统。

## 语言与工具链

先把程序写出来，再逐步练习组织数据、拆包、处理错误和并发。测试与诊断工具也放在这一部分，方便边写边验证。

[查看这个分类](/notes?category=go-part1)

- [01 学 Go 后端，我会先把请求走过的路径画出来](/notes/go-01-roadmap)
- [02 Go 工具链与 Modules：先把运行环境对齐](/notes/go-02-toolchain)
- [03 读懂 Go 程序：包、声明与入口](/notes/go-03-program-basics)
- [04 类型与流程控制：先明确数据能取什么值](/notes/go-04-types-control)
- [05 数组、切片、map 和字符串的边界](/notes/go-05-collections)
- [06 函数、方法与指针接收者怎么选](/notes/go-06-functions-methods)
- [07 结构体、接口与泛型：先表达业务关系](/notes/go-07-structs-interfaces)
- [08 错误处理：让失败沿调用链说清楚](/notes/go-08-errors)
- [09 包与依赖：让业务规则留在自己的位置](/notes/go-09-packages)
- [10 goroutine 与 channel：启动之外还要负责退出](/notes/go-10-concurrency)
- [11 锁与 context：保护状态，传递取消](/notes/go-11-sync-context)
- [12 值、引用、逃逸与垃圾回收](/notes/go-12-memory)
- [13 后端常用标准库：I/O、JSON、时间与 HTTP](/notes/go-13-stdlib)
- [14 表驱动测试与 Go 开发检查](/notes/go-14-testing-tools)

## HTTP 与服务设计

先看 HTTP 协议与标准库，再用 Gin 组织服务，把接口、安全和配置的边界一起确定下来。

[查看这个分类](/notes?category=go-part2)

- [15 HTTP 与 REST：状态码也是接口的一部分](/notes/go-15-http-rest)
- [16 net/http：请求处理、超时与优雅关闭](/notes/go-16-net-http)
- [17 用 Gin 写接口，业务边界仍要自己划](/notes/go-17-gin)
- [18 API 合同：字段、分页和幂等键怎么约定](/notes/go-18-api-contracts)
- [19 配置、日志与服务的启动和关闭](/notes/go-19-config-logging)
- [20 认证、授权与 Web 安全的几条边界](/notes/go-20-security)

## 数据库、缓存与消息

除了会调用客户端，还要弄清事务、一致性、重复请求和恢复分别由谁负责。

[查看这个分类](/notes?category=go-part3)

- [21 MySQL 建模与 SQL：从查询和业务状态出发](/notes/go-21-mysql-sql)
- [22 索引与查询优化：让执行计划给出依据](/notes/go-22-indexes)
- [23 事务、锁与连接池：并发扣库存怎么保证正确](/notes/go-23-transactions-locks)
- [24 GORM 的作用与持久层的边界](/notes/go-24-gorm-repository)
- [25 Redis 缓存：命中之外，还要考虑失效和恢复](/notes/go-25-redis-cache)
- [26 Redis 高并发：原子预留与跨系统事务的区别](/notes/go-26-redis-concurrency)
- [27 Kafka：顺序、offset 与重复消费](/notes/go-27-kafka)
- [28 消息可靠性：幂等、重试、Outbox 与补偿](/notes/go-28-message-reliability)

## 促销订单项目

把前面的语言、HTTP 和数据知识放回同一个下单流程。每一步都保留一个能运行的阶段版本，失败时可以回头定位。

[查看这个分类](/notes?category=go-part4)

- [29 限时促销项目：先确定接口与订单状态](/notes/go-29-project-design)
- [30 搭服务骨架：配置、依赖装配与健康检查](/notes/go-30-project-skeleton)
- [31 商品和促销：时间、价格与资格由谁确认](/notes/go-31-catalog-campaign)
- [32 普通下单：库存与订单要一起提交](/notes/go-32-order-inventory)
- [33 异步抢购：从库存预留到订单落库](/notes/go-33-flash-sale)
- [34 支付回调、通知与对账：重复和迟到都要处理](/notes/go-34-payment-reconciliation)

## 测试、性能与微服务

先用测试和测量看清现有系统，再考虑拆分服务，以及拆分后多出来的网络与一致性成本。

[查看这个分类](/notes?category=go-part5)

- [35 项目测试：按业务风险选择验证层次](/notes/go-35-test-strategy)
- [36 压测与 pprof：解释吞吐和尾延迟](/notes/go-36-performance)
- [37 从模块化单体到微服务：先说明拆分的收益](/notes/go-37-microservices-grpc)
- [38 超时、重试、限流与熔断怎么配合](/notes/go-38-resilience)
- [39 跨服务一致性与数据扩展的代价](/notes/go-39-distributed-data)

## 部署与运维

从本地可复现环境走到部署，继续检查构建、调度、观测和恢复。

[查看这个分类](/notes?category=go-part6)

- [40 Docker 与 Compose：把运行环境留下来](/notes/go-40-docker-compose)
- [41 Kubernetes 入门：Pod、Deployment 与流量入口](/notes/go-41-kubernetes-basics)
- [42 Kubernetes 发布：资源、探针和扩缩容](/notes/go-42-kubernetes-production)
- [43 日志、指标与 Trace：从异常找到调用链](/notes/go-43-observability)
- [44 CI/CD：让每次发布有可追溯的结果](/notes/go-44-cicd)
- [45 生产排障：先确认影响，再定位原因](/notes/go-45-operations)

## 进阶专题

这些内容按实际问题选读，不要求把每种组件都加入订单示例。比较方案时，先写出当前缺少的能力和愿意承担的成本。

[查看这个分类](/notes?category=go-advanced)

- [专题 01 Elasticsearch：把搜索当作可重建的投影](/notes/go-advanced-01-elasticsearch)
- [专题 02 RabbitMQ 与 Kafka：从消息要怎么用来选型](/notes/go-advanced-02-messaging-choice)
- [专题 03 读写分离与分片：扩展数据库之前先看约束](/notes/go-advanced-03-database-scaling)
- [专题 04 配置中心和服务网格：先确认平台还缺什么](/notes/go-advanced-04-service-discovery-mesh)
- [专题 05 比较 MySQL 与 PostgreSQL，我会看哪些问题](/notes/go-advanced-05-postgresql)
- [专题 06 请求慢在哪里：DNS、TCP、TLS 与 Linux 网络](/notes/go-advanced-06-networking-linux)

## 配套资料

- [Go 后端资料索引与术语](/notes/go-reference)

## 示例怎么运行

Go 语法示例按 Go 1.27 系列整理；涉及旧版循环变量行为时会另行说明。独立代码片段可能省略导入和上下文，完整程序会给出文件与运行方法。数据库、缓存和部署配置仍需在相应版本的环境中验证。

