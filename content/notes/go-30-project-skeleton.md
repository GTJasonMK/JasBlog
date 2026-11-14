---
title: "Go 30：搭服务骨架：配置、依赖装配与健康检查"
date: "2026-11-12"
excerpt: "我会先做一个能启动、能说明自身状态、也能正常退出的服务。业务还没有写满时，就把依赖怎么装配、失败在哪里返回这些规则固定下来。"
tags: [ "Go", "促销订单项目" ]
category: "go-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会先做一个能启动、能说明自身状态、也能正常退出的服务。业务还没有写满时，就把依赖怎么装配、失败在哪里返回这些规则固定下来。

## 推荐结构

~~~text
cmd/api/             启动入口与依赖装配
internal/config/     配置读取与校验
internal/httpapi/    Gin 路由、DTO、中间件
internal/order/      订单领域规则
internal/catalog/    商品与促销规则
internal/store/mysql/数据库适配器
internal/store/redis/Redis 适配器
~~~

main 函数负责加载配置、连接依赖、创建 Handler、启动 HTTP Server，并按相反顺序关闭资源。业务包不导入 Gin；存储接口由业务调用方定义，存储适配器负责实现。

## 公共能力

配置字段要有默认值和必填规则；日志使用结构化字段并加入 request_id；错误在 Handler 边界映射为稳定 API code。/healthz 只检查进程是否活着，/readyz 检查当前实例是否可以接收流量，两者不能混为一个始终返回成功的接口。依赖探测应反映实际服务能力：若某个降级路径仍可用，不要因为一个非关键依赖短暂失败就让所有 Pod 同时退出流量。

## 运行后检查

创建模块、启动 HTTP 服务、返回健康状态，并可通过 SIGTERM 优雅关闭。启动缺少数据库配置时应给出明确错误，而不是悄悄使用空配置。

## 动手验证

为配置校验写表驱动测试；再创建一个不连接数据库的 Handler 单元测试。

---

[上一篇：限时促销项目：先确定接口与订单状态](/notes/go-29-project-design) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：商品和促销：时间、价格与资格由谁确认](/notes/go-31-catalog-campaign)

