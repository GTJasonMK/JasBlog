---
title: "TypeScript 48：Prisma 建模与查询：类型之外仍有访问规则"
date: "2026-11-12"
excerpt: "Prisma知道Task有ownerId，为什么用户仍可能读到别人的任务？从模型生成、查询条件与字段选择解释类型安全的范围，再看级联删除真正会做什么。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Prisma会提示Task有哪些字段，也会拒绝拼错字段名，但 `where: { id }` 与 `where: { id, ownerId }` 都可能类型正确。能构造查询和应该允许查询，是两层不同规则，授权仍取决于实际条件。

Prisma Schema 描述数据源、生成器、模型和关系。生成的 Prisma Client 根据模型提供查询 API 与静态类型。应用通过依赖注入或集中模块使用一个 Prisma Client 实例。

~~~prisma
enum TaskStatus {
  todo
  in_progress
  done
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  tasks        Task[]
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(todo)
  dueAt       DateTime?
  ownerId     String
  owner       User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([ownerId, createdAt])
}
~~~

这是与项目规格一致的模型片段；完整 schema 还需要 generator 和 datasource 配置。查询只选择需要的字段。使用 where 限定当前用户，使用 orderBy 和 take 实现排序与分页。

固定所用Prisma主版本，再按该版本提供生成器、数据源、客户端输出与驱动配置；不要把不同版本教程的初始化片段混在一起。模型变化后重新生成客户端，让检查器使用当前Schema，迁移则负责让真实数据库结构对应它，二者不是同一步。

Task.ownerId非空且引用User.id，表示任务必须属于有效用户；User.tasks是关系访问，不意味着表里保存一份无限任务数组。status有数据库枚举与默认值，title却只是String，1到120的规则仍由请求Schema及所需数据库约束维护。

onDelete: Cascade在这里明确选择“删除用户同时删除其任务”。这适合受控个人任务练习，不代表任何业务都该级联；若需要保留审计或恢复，应改成相应删除政策并测试。不要把relation配置当成没有实际数据后果的类型注解。

## 一次查询怎样变成公开响应

where绑定当前用户，select列出允许返回的id、title与status，orderBy与take限制结果。Date字段需要按API约定序列化，passwordHash不进入公开用户对象。单纯标注一个较小返回类型，不会自动删除真实对象额外字段。

Client通常由进程入口集中创建与关闭，避免每个请求新建连接池。读取关联时观察SQL数量和数据量，避免逐条加载形成N+1，也避免一次include整张关系图。生成API减少拼写错误，真实数据库计划与资源占用仍需检查。

## ORM 不会自动完成授权

- ORM 类型安全不能替代请求校验和授权。
- 查询关联时留意 N+1 问题和返回数据体积。
- 不要把 Prisma Model 原样返回前端。

## 动手验证

实现按 ownerId 查询任务列表，并只返回 id、title、status；尝试查找一个不存在的任务。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：用户与任务的数据关系怎么设计](/notes/typescript-47-data-modeling) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：迁移、种子数据与事务：让数据变更能重现](/notes/typescript-49-migrations-transactions)

