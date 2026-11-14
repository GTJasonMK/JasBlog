---
title: "TypeScript 53：任务 API：把会话、校验和持久化连起来"
date: "2026-11-12"
excerpt: "列表只显示自己的任务，详情接口就安全了吗？把会话、输入Schema与带归属条件的读写接起来，逐条确认创建、修改和删除的真实数据库范围。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

列表已经按用户过滤，但详情直接按id查，知道编号的人仍然可以越权。权限必须落实到每条实际读写路径，不能从一个页面看不到他人任务推断整个API安全。

每个任务路由都依赖已认证用户。创建时由服务端设置 ownerId，不接受客户端提供的 ownerId。读取、修改和删除应把任务 id 与当前用户 id 一起放进数据库条件。

示例中的 request.user 由认证中间件写入；项目需要通过 Express 类型扩展声明它，并确保路由只在认证中间件之后运行。

声明字段不创建身份。未认证请求应在中间件明确结束，后面的业务才能使用已确认userId；也可以通过带认证结果的服务参数表达，避免全局把每个Request都声明成天然已登录。

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

读取片段位于认证后的路由内部，任务不存在或不属于当前用户都返回同一404，减少资源存在性泄露。公开字段通过select限制，数据库其他列不随对象一起返回。

创建使用解析后的title与status，加上当前userId构造data；不能先展开整个body，再以为后面一项身份字段就覆盖了全部风险。修改使用UpdateTaskSchema得到白名单字段，并在实际更新条件里同时带id与ownerId；删除也一样，检查受影响行数决定404或成功。

先查询授权、再按id无条件修改，在归属可变或记录并发变化时可能留下窗口。把权限条件放到写语句中更直接；需要更新后返回对象时，按所用Prisma版本与事务合同组织返回，不靠额外非受控读取猜结果。

## 所有单条读写都要检查归属

- 接口收到 ownerId 时不可盲目信任。
- 仅前端隐藏任务不是数据隔离。
- 详情、更新、删除都必须执行所有权检查。

列表分页、响应映射与错误码来自共同接口合同，单次请求失败不能返回空对象冒充任务。数据库异常由边界记录并映射系统失败，未找到则按稳定业务错误处理。

两个用户的验收覆盖列表、详情、PATCH、DELETE与伪造ownerId创建。每次越权尝试后独立查数据库，确认受害者记录没有变化；只看状态码还不足以排除先写后报错。

## 动手验证

补齐任务列表、创建、修改和删除路由；用两个用户验证各自只能访问自己的数据。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：共享 Schema：让前后端使用同一份接口规则](/notes/typescript-52-shared-contracts) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：注册、登录、刷新与退出的完整流程](/notes/typescript-54-auth-integration)

