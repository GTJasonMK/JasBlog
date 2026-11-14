---
title: "TypeScript 49：迁移、种子数据与事务：让数据变更能重现"
date: "2026-11-12"
excerpt: "数据库结构的变化也需要留下顺序和记录。我会先在测试库执行迁移，确认已有数据怎样变化，再把它纳入发布；需要一起完成的写入，则交给同一个事务。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

数据库结构的变化也需要留下顺序和记录。我会先在测试库执行迁移，确认已有数据怎样变化，再把它纳入发布；需要一起完成的写入，则交给同一个事务。

迁移记录 Schema 的版本变化，让开发、测试和生产数据库按相同顺序升级。种子脚本用于创建测试或演示数据，必须可重复运行或明确清理策略。事务适合需要全成或全败的多步写入。

部署时先构建应用，再执行已审核的数据库迁移，最后启动新版本。不要在生产启动时静默重置数据库。

~~~ts
const passwordHash = await hashPassword(seedPassword);

await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: seedEmail, passwordHash },
  });
  await tx.task.create({
    data: { ownerId: user.id, title: "示例任务", status: "todo" },
  });
});
~~~

先在事务外完成密码哈希等耗时计算，再用事务写入 User 与关联 Task。这样示例直接对应贯穿项目的模型；如果任一步写入失败，事务整体回滚。

## 已经执行过的迁移不能随意改写

- 迁移文件是历史记录，不要随意修改已在共享环境执行的迁移。
- 生产备份和回滚策略要先于危险迁移。
- 事务不应包住很长的外部网络调用。

## 动手验证

增加任务优先级字段并生成迁移；说明旧任务如何获得兼容默认值。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Prisma 建模与查询：类型之外仍有访问规则](/notes/typescript-48-prisma) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：认证与授权：保护任务属于谁这件事](/notes/typescript-50-auth-security)

