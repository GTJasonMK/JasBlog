---
title: "TypeScript 48：Prisma 建模与查询：类型之外仍有访问规则"
date: "2026-11-12"
excerpt: "Prisma 根据模型生成查询类型，但是否应该查到某条任务，仍然由 where 条件和身份判断决定。我会把当前用户条件写进查询，并只选出页面需要的字段。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Prisma 根据模型生成查询类型，但是否应该查到某条任务，仍然由 where 条件和身份判断决定。我会把当前用户条件写进查询，并只选出页面需要的字段。

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

## ORM 不会自动完成授权

- ORM 类型安全不能替代请求校验和授权。
- 查询关联时留意 N+1 问题和返回数据体积。
- 不要把 Prisma Model 原样返回前端。

## 动手验证

实现按 ownerId 查询任务列表，并只返回 id、title、status；尝试查找一个不存在的任务。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：用户与任务的数据关系怎么设计](/notes/typescript-47-data-modeling) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：迁移、种子数据与事务：让数据变更能重现](/notes/typescript-49-migrations-transactions)

