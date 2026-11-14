---
title: "Go 学习笔记：目录与阅读路线"
date: "2026-11-12"
excerpt: "写出接口以后，还要回答超时有没有下单、重复消息有没有重复扣库存。按一次请求从语言到持久化的路径整理Go笔记，让组件与它要解决的问题对应起来。"
tags: [ "Go" ]
category: "go"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个接口能返回JSON以后，新的问题才开始出现：请求超时究竟有没有创建订单，两个请求怎样争最后一件库存，消费者重启为何又收到同一事件。这些问题分别涉及语言状态、网络边界与持久化规则，不能靠换一个框架一起解决。

这组笔记沿请求路径展开，先掌握值、错误、并发和资源生命周期，再处理HTTP与本地事务，之后讨论缓存、消息与服务拆分。促销订单作为共同例子，重点是能解释成功与失败过程；片段与设计练习不等于一套直接上线的商城。

初学从语言部分顺读，已经会写接口则可以先选23、32和35，把库存事务与验证连接起来。遇到重复消费再读27、28，出现容量证据再读36以后。进阶组件按实际问题选，不要求全部加进同一个项目。

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

把语言、HTTP与数据放回同一个下单流程。实现练习时保留可运行阶段，分别核对请求、库存、订单和幂等结果，失败时回到明确边界定位。

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

读片段时先列出所需类型、导入和外部资源，避免把事务片段直接当完整程序。验证语言行为使用临时模块，验证锁与SQL使用隔离数据库，故障练习只操作自己创建的资源。运行结果与预期不同，先沿输入和状态变化解释差异，再添加组件。

