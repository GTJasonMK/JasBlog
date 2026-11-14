---
title: "TypeScript 47：用户与任务的数据关系怎么设计"
date: "2026-11-12"
excerpt: "一个用户可以有很多任务，但每条任务都得有明确的所有者。我会同时设计主键、外键和唯一约束，再拿实际查询检查索引，让数据规则不只存在于前端表单里。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个用户可以有很多任务，但每条任务都得有明确的所有者。我会同时设计主键、外键和唯一约束，再拿实际查询检查索引，让数据规则不只存在于前端表单里。

User 与 Task 是一对多关系：每条任务有一个 ownerId 外键。主键唯一标识记录；NOT NULL、UNIQUE、CHECK 和外键约束能在数据库层阻止无效状态。索引可加速常见过滤和排序，但会增加写入与存储成本。

任务列表常按 owner_id 与 created_at 查询，可考虑组合索引。索引要基于查询模式和执行计划决定，不能无目的添加。

事务把多条相关变更作为整体提交或回滚。使用 EXPLAIN 或 EXPLAIN ANALYZE 检查查询计划；后者会实际执行查询，不要对有副作用的语句随意运行。

## 并发情况下仍需要数据库约束

- 前端校验不能保护数据库完整性。
- 只用应用代码检查唯一值会遇到并发竞争，数据库仍需 UNIQUE 约束。
- 外键和删除策略应符合业务需要，避免意外级联删除。

## 动手验证

设计 User 与 Task 的表字段、唯一约束和外键；解释删除用户时任务该如何处理。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：关系数据库与 SQL：从持久化到关联查询](/notes/typescript-46-sql) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：Prisma 建模与查询：类型之外仍有访问规则](/notes/typescript-48-prisma)

