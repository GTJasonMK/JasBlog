---
title: "TypeScript 53：任务 API：把会话、校验和持久化连起来"
date: "2026-11-12"
excerpt: "这里把前面的边界放回一条完整请求：先确认当前用户，再解析输入，最后按资源归属读写数据库。创建任务时，ownerId 应由服务端身份决定。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

这里把前面的边界放回一条完整请求：先确认当前用户，再解析输入，最后按资源归属读写数据库。创建任务时，ownerId 应由服务端身份决定。

每个任务路由都依赖已认证用户。创建时由服务端设置 ownerId，不接受客户端提供的 ownerId。读取、修改和删除应把任务 id 与当前用户 id 一起放进数据库条件。

示例中的 request.user 由认证中间件写入；项目需要通过 Express 类型扩展声明它，并确保路由只在认证中间件之后运行。

~~~ts
const task = await prisma.task.findFirst({
  where: { id: request.params.id, ownerId: request.user.id },
  select: { id: true, title: true, status: true },
});

if (!task) {
  response.status(404).json({
    error: { code: "TASK_NOT_FOUND", message: "任务不存在" },
  });
  return;
}
~~~

列表接口同样按 ownerId 过滤。修改请求先通过 Schema 验证，仅传允许更改的字段。

## 所有单条读写都要检查归属

- 接口收到 ownerId 时不可盲目信任。
- 仅前端隐藏任务不是数据隔离。
- 详情、更新、删除都必须执行所有权检查。

## 动手验证

补齐任务列表、创建、修改和删除路由；用两个用户验证各自只能访问自己的数据。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：共享 Schema：让前后端使用同一份接口规则](/notes/typescript-52-shared-contracts) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：注册、登录、刷新与退出的完整流程](/notes/typescript-54-auth-integration)

