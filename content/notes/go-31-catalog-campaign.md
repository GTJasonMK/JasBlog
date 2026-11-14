---
title: "Go 31：商品和促销：时间、价格与资格由谁确认"
date: "2026-11-12"
excerpt: "参与活动时，客户端传来的价格不能作为结算依据。我会从服务端重新确认商品状态、活动时间和用户资格，尤其把开始和结束这两个边界时刻写进测试。"
tags: [ "Go", "促销订单项目" ]
category: "go-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

参与活动时，客户端传来的价格不能作为结算依据。我会从服务端重新确认商品状态、活动时间和用户资格，尤其把开始和结束这两个边界时刻写进测试。

## 业务边界

商品保存基础名称和状态；促销保存开始与结束时间、商品、限购数量和活动库存。请求进入时校验活动状态和用户资格。价格与商品信息应由服务端读取，不能接受客户端传入的价格作为结算依据。

## Handler 与业务服务

Handler 负责解析路径参数和身份，业务服务负责校验活动状态与调用存储接口，存储层负责 SQL。按这个顺序传递 context 和明确参数，不用全局变量共享数据库连接。

~~~go
type Campaign struct {
	ID        int64
	ProductID int64
	StartsAt  time.Time
	EndsAt    time.Time
	Limit     int
}

func (c Campaign) ActiveAt(now time.Time) bool {
	return !now.Before(c.StartsAt) && now.Before(c.EndsAt)
}
~~~

业务校验时间要注入或传入当前时间，方便测试边界时刻。生产项目也应考虑时钟来源、时区和活动配置变更。

## 动手验证

测试活动开始前、开始时、结束前和结束时四个时间点；增加无效时间范围和限购量校验。

---

[上一篇：搭服务骨架：配置、依赖装配与健康检查](/notes/go-30-project-skeleton) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：普通下单：库存与订单要一起提交](/notes/go-32-order-inventory)

