---
title: "Go 24：GORM 的作用与持久层的边界"
date: "2026-11-12"
excerpt: "用 ORM 时，我仍然会看它生成的 SQL。对象映射解决了一部分重复代码，但索引、事务范围和并发写入的规则，并不会因为换了一套 API 就消失。"
tags: [ "Go", "数据库、缓存与消息" ]
category: "go-part3"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

用 ORM 时，我仍然会看它生成的 SQL。对象映射解决了一部分重复代码，但索引、事务范围和并发写入的规则，并不会因为换了一套 API 就消失。

## 使用 ORM 的边界

GORM 可减少常见映射代码，适合普通增删改查。开发者仍要理解 SQL、索引、锁和事务。热点路径可使用明确的参数化 SQL，但不要把业务规则复制到多个访问路径。

~~~go
err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	result := tx.Model(&Inventory{}).
		Where("product_id = ? AND available >= ?", productID, quantity).
		Update("available", gorm.Expr("available - ?", quantity))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected != 1 {
		return ErrInsufficientStock
	}
	return tx.Create(&order).Error
})
~~~

真实代码应为数据库设置连接池和超时，所有查询带调用者 context。利用 SQL 日志或 DryRun 等能力检查生成语句，注意日志中的敏感参数处理。

在进入事务前先校验 quantity > 0，并为 product_id 建立唯一索引；不能仅依赖 RowsAffected == 1 来弥补无效数量或重复库存行。

## 迁移

教学项目可以使用版本化迁移脚本。自动迁移适合受控的本地演示，但生产结构变更应审查增删列、索引锁表和兼容发布顺序。数据库迁移失败要让部署显性失败。

## 动手验证

为订单查询定义持久层接口和 GORM 实现；用事务完成[第 23 章](/notes/go-23-transactions-locks)的扣库存与创建订单，并测试回滚。

---

[上一篇：事务、锁与连接池：并发扣库存怎么保证正确](/notes/go-23-transactions-locks) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：Redis 缓存：命中之外，还要考虑失效和恢复](/notes/go-25-redis-cache)

