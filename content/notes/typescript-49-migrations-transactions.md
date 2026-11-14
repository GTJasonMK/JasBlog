---
title: "TypeScript 49：迁移、种子数据与事务：让数据变更能重现"
date: "2026-11-12"
excerpt: "代码已经有priority字段，旧数据库却没有，生成客户端能解决吗？区分模型、迁移与种子，再用用户和任务的一次事务说明提交与重复运行的边界。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Schema加了priority，编辑器认识它，运行查询却说列不存在。生成客户端更新了应用的类型与查询代码，数据库仍需要执行迁移。应用声明和持久数据必须一起演进，不能靠重新生成类型代替结构变更。

迁移记录 Schema 的版本变化，让开发、测试和生产数据库按相同顺序升级。种子脚本用于创建测试或演示数据，必须可重复运行或明确清理策略。事务适合需要全成或全败的多步写入。

部署时先构建应用，再执行已审核的数据库迁移，最后启动新版本。不要在生产启动时静默重置数据库。

新增非空字段先考虑旧行怎样填。若默认优先级有明确含义，可以用受审查默认值；若必须从历史业务推导，先加可空字段、分批回填与核对，再收紧约束。大表回填、索引与锁占用都要在接近实际规模上评估。

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

片段假定已有prisma、hashPassword与专用演示账号输入，演示一次性创建。重复执行同一邮箱会触发唯一冲突，并不是可重复种子脚本。需要反复初始化测试数据时，用稳定身份与明确upsert或专属数据清理策略，不吞掉任何冲突就当成功，也不重置真实账号密码。

事务回调里的写入都用tx。如果中途改用外部prisma客户端，可能落在另一事务中；后续失败不再保证一起撤销。事务短小并检查最终结果，外部HTTP、邮件与不可重复副作用不要混进可重试数据库事务。

## 已经执行过的迁移不能随意改写

- 迁移文件是历史记录，不要随意修改已在共享环境执行的迁移。
- 生产备份和回滚策略要先于危险迁移。
- 事务不应包住很长的外部网络调用。

本地用migrate dev创建与验证迁移，部署用migrate deploy执行已有历史。迁移文件、模型和生成方式一起进版本控制；共享环境执行过的迁移用后续迁移修正，不修改历史假装从未发生。

验收从空库执行全部历史，再在带旧数据的库升级，核对默认值、约束与查询。应用回滚以后能否理解新结构也要验证，数据库有备份不等于一次破坏性变更可以无成本撤回。

## 动手验证

增加任务优先级字段并生成迁移；说明旧任务如何获得兼容默认值。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Prisma 建模与查询：类型之外仍有访问规则](/notes/typescript-48-prisma) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：认证与授权：保护任务属于谁这件事](/notes/typescript-50-auth-security)

