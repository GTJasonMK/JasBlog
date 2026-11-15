---
title: "Go 完整实作：事务订单、异步受理与消息重放"
date: "2026-11-15"
excerpt: "沿固定版本完整工程解释业务边界、失败处理与验证，区分本地实测、配置检查和待运行场景。"
tags: ["Go", "工程实践"]
category: "go-part4"
publication: "published"
display: { "toc": true }
publishedAt: "2026-11-15"
---

[下载 0.1.1 版完整源码](/downloads/jas-learning-v0.1.1.zip)，解压后从项目根目录按步骤运行。[版本与校验信息](/downloads/jas-learning-v0.1.1.json)。

客户端超时后订单可能已经提交，消费者重启后同一消息可能再次抵达。单商品促销工程把这些过程做成可运行、可中断、可核对的路径。版本为 0.1.0。

## 准备并运行

从 JasLearning 根目录启动依赖，显式迁移和初始化：

```bash
python3 scripts/services.py start mysql redis kafka
python3 scripts/services.py run -- go -C go run ./cmd/api migrate
python3 scripts/services.py run -- go -C go run ./cmd/api seed
python3 scripts/services.py run -- go -C go run ./cmd/api topics
python3 scripts/services.py run -- env ALLOW_MOCK_PAYMENT=true go -C go run ./cmd/api
```

另一个终端运行 python3 scripts/services.py run -- go -C go run ./cmd/worker。API 默认 8080。seed 创建 a@example.invalid 与 b@example.invalid，密码来自本机 DEMO_PASSWORD；它不重设已有密码和已消耗库存。凭据留在受控本机配置，不复制进文章或日志。

登录 POST /api/v1/auth/login 接收 email、password，后续请求带 Bearer 令牌。POST /api/v1/orders 接收 product_id、quantity 和 Idempotency-Key。活动 1 的异步入口是 POST /api/v1/campaigns/1/claims，202 返回状态查询地址，生成订单后再按订单编号查询。

## 本地事务保证什么

internal/order/store.go 维护订单不变量，HTTP 与消费者共用它。输入限制商品、数量与请求键，金额使用整数分并受价格与数量上限约束，数据库是最终库存和订单事实来源。

事务先锁当前用户，再按用户与请求键读取原结果。同一用户写入串行化，换来直接的幂等边界；容量增长后再根据实测评估细粒度锁。条件更新检查库存，再共同写订单、流水和 Outbox，任一步失败都回滚。

同键不同内容明确冲突，缺货不留半张订单。订单查询带 user_id，支付锁定订单并检查原状态。相同流水重复成功不重复入账，金额冲突和非法状态不覆盖既有事实。模拟回调需显式开启和独立密钥，部署清单默认关闭。

## 异步增加了哪些责任

internal/order/queue.go 的 Lua 同时检查 Redis 预算、记录请求并追加 Stream，重复键先比较指纹。相关键使用相同 hash tag，明确 Redis Cluster 的同槽约束。

Redis 是受理预算，MySQL 仍检查最终库存。同步下单或 Redis 恢复后预算可能过时，202 不承诺已经建单。Lua 不提供跨系统事务，脚本错误也不会自动回滚已执行的命令，必须核对类型、内存与持久化条件。

relay 取得 Kafka 确认以后才 XACK；在两者之间退出会重复发送，event_id 保持不变。XAUTOCLAIM 回收空闲 pending，未完成消息不盲目裁剪。

消费者先调用共同订单入口，再更新受理状态，最后提交 offset。处理失败保留当前消息重试；依赖故障时重建 reader 从最后提交位置重放，不能继续读取并提交更大 offset 跳过失败消息。

确定缺货等业务失败按原预留身份补偿一次。提交结果未知时保留待处理，技术失败达上限保存 dead_letters 并标记 needs_review，不擅自释放可能已成交的库存。值班先按原键核对订单、预留与事件，再决定重放或补偿。

## Outbox 与观测

Outbox 与订单共同提交，后台取得有期限的发送租约，Broker 确认后标记 published_at。租约过期允许接手，因此通知消费者也要按稳定事件身份去重。达重试上限的记录需要告警和核对，不能删除记录掩盖积压。

HTTP 日志带 request_id、路由、状态与耗时。OpenTelemetry 将 HTTP、订单事务和消费接入 Trace，事件携带 traceparent；本版 span 导出到标准输出，集中采集时接组织的 Collector。日志不记录密码和完整连接串。

/healthz 表示进程存活，/readyz 检查依赖，/metrics 提供请求计数。诊断还需要连接池等待、Redis pending、Kafka lag 与最老 Outbox 记录。压测分别记录受理、完成、失败与积压清空时间。

## 验证失败窗口

```bash
python3 scripts/services.py run -- env LEARNING_INTEGRATION=1 go -C go test -race -timeout 60s ./...
```

集成测试建立自己的数据库、Redis 前缀和 Kafka topic。除库存竞争、内容冲突、支付重放、越权外，还在 Broker 确认后注入退出，让相同事件重复抵达，确认订单和扣减只有一份。确定失败的预留重复补偿也只释放一次。

普通 go test 会明确跳过外部依赖测试，不能记为集成通过。go vet、构建与压测是不同证据，性能结论需保留硬件、数据、流量模型和重复测量。

## 从教学网络迁到生产

部署代码在 deploy。单节点消息服务和默认本机明文网络用于教学，不能承诺跨机持久性。internal/config/kafka.go 统一管理生产者与消费者的 TLS、CA 和 SCRAM-SHA512。KAFKA_TLS=true 启用证书校验；需要私有 CA 时提供 KAFKA_CA_FILE，认证同时提供 KAFKA_SASL_USER 与 KAFKA_SASL_PASSWORD，明文连接不能发送认证凭据。topics 命令用于本机初始化，企业环境由有管理权限的发布阶段准备 topic，运行账号只给必要读写权限。

Redis 使用 rediss URL、MySQL 使用启用证书验证的驱动 TLS 配置。落实独立身份、持久化与告警后，再复验相同故障窗口；不能关闭证书校验换取连接成功。


[系列目录](/notes/go-00-learning-guide) · [Kubernetes 配置](/notes/go-kubernetes-lab)
