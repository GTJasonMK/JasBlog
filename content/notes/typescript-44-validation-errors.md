---
title: "TypeScript 44：输入校验与错误响应：在边界拒绝无效数据"
date: "2026-11-12"
excerpt: "请求一进来，我会先解析路径、查询和请求体，再把规范化后的值交给业务。校验失败、未登录和数据库故障需要不同反馈，不能一律变成空对象。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

请求一进来，我会先解析路径、查询和请求体，再把规范化后的值交给业务。校验失败、未登录和数据库故障需要不同反馈，不能一律变成空对象。

客户端输入是不可信的。用 Zod Schema 检查请求 body、query 和 path 参数，再把已解析的输入交给业务逻辑。校验失败返回 400 或 422；未登录返回 401；无权限返回 403 或隐藏资源的 404。

~~~ts
const parsed = CreateTaskSchema.safeParse(request.body);
if (!parsed.success) {
  response.status(400).json({
    error: { code: "INVALID_INPUT", message: "输入格式不正确" },
  });
  return;
}
~~~

错误处理中间件统一记录错误并构造响应。预期业务错误和程序错误应能区分，程序错误不能被伪装成成功结果。

## 错误需要明确，也不能泄露内部信息

- 校验不能只检查字段存在，还要检查长度、范围和合法集合。
- 错误消息不要泄露 SQL、文件路径或秘密。
- 不要 catch 后返回空对象或默认值掩盖失败。

## 动手验证

分别测试空标题、未知状态、无效 id 和数据库不可用时的 API 状态码及响应。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：把任务操作设计成 REST API](/notes/typescript-43-rest-api) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：日志与环境配置：启动就把问题暴露出来](/notes/typescript-45-logging-config)

