---
title: "Go 09：包与依赖：让业务规则留在自己的位置"
date: "2026-11-12"
excerpt: "拆包时，我会先看一组代码负责什么，而不是先建 controller、service、utils 等目录。依赖方向清楚之后，HTTP 框架和数据库实现就可以在入口组装，不必渗进每条业务规则。"
tags: [ "Go", "语言与工具链" ]
category: "go-part1"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

拆包时，我会先看一组代码负责什么，而不是先建 controller、service、utils 等目录。依赖方向清楚之后，HTTP 框架和数据库实现就可以在入口组装，不必渗进每条业务规则。

包应围绕一组稳定职责组织，而不是只按“文件类型”机械拆分。每个包尽量有清楚的输入、输出和依赖。Go 导入方向应从较外层的接口适配器指向业务核心；业务规则不应依赖 Gin、MySQL 驱动或 Redis 客户端。

一个中型服务可从简单布局开始：

~~~text
cmd/api/          程序入口与依赖组装
internal/order/   订单业务
internal/httpapi/ HTTP 路由和请求响应
internal/store/   数据持久化适配器
~~~

internal 目录限制其包只能被父目录范围内的代码导入。不要为了“标准结构”提前创建大量空目录；模块变大时再拆。

## 依赖注入

依赖注入可以是构造函数参数，不一定要引入容器。由入口组装 MySQL、Redis、业务服务和 HTTP Handler，再把需要的接口传进去。这样测试可以用内存实现替代外部系统。

## 包名要能说明职责

- 避免 utils、common 这类不断膨胀且职责模糊的包。
- 不要让业务包直接调用全局数据库连接；显式传入依赖更容易测试和关闭资源。
- 导出名称是公共 API，尽量只导出真正要被其他包使用的类型和函数。

## 动手验证

把订单计算、HTTP 参数解析和数据库访问分成三个职责。画出依赖箭头，确保业务规则不依赖 HTTP 框架。

---

[上一篇：错误处理：让失败沿调用链说清楚](/notes/go-08-errors) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：goroutine 与 channel：启动之外还要负责退出](/notes/go-10-concurrency)

