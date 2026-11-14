---
title: "TypeScript 44：输入校验与错误响应：在边界拒绝无效数据"
date: "2026-11-12"
excerpt: "校验成功后仍保存原始request.body，trim为什么没起作用？沿输入解析、业务调用和错误映射追踪实际值，保留用户错误与系统故障的区别。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Schema成功解析了标题，数据库里却仍带两端空格，常见原因是校验以后继续使用request.body。检查的作用不仅是给一个通过标记，还会产生已经规范化的结果。后续业务应该接收这份结果。

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

这是路由内部片段，CreateTaskSchema来自29章或共享包。成功分支使用parsed.data，不能又把未经处理的整个body展开进数据库；失败分支响应以后立即return，避免继续执行创建。

错误处理中间件统一记录错误并构造响应。预期业务错误和程序错误应能区分，程序错误不能被伪装成成功结果。

body、query与params分别解析。查询参数可能是字符串、数组或其他解析结果，页码不能直接as number；路径编号要按项目实际格式检查，不能只用一个truthy判断。未知字段、空PATCH与null清除策略也保持统一。

字段合法以后，资源是否属于当前用户、数据库是否可用仍可能失败。Schema错误映射400或约定422，未登录401，越权按合同403或404，系统故障保留5xx。不能catch任何异常都说“输入格式错误”，那会让用户为服务端故障反复修改无辜字段。

## 给用户什么，给排查什么

响应保留稳定code与适当字段错误，便于页面关联输入；请求标识用于联系日志。日志记录真实原因和调用上下文，敏感值与内部连接信息不交给客户端。若服务端规范字段错误结构，前端也不必按中文文案猜哪个输入有问题。

## 错误需要明确，也不能泄露内部信息

- 校验不能只检查字段存在，还要检查长度、范围和合法集合。
- 错误消息不要泄露 SQL、文件路径或秘密。
- 不要 catch 后返回空对象或默认值掩盖失败。

验证空标题、空白、长度边界、未知状态、额外ownerId和无效分页，并检查失败时没有写入。再制造数据库失败，确认它没有被误报成用户输入问题。每个失败路径既看响应，也看业务状态是否保持。

## 动手验证

分别测试空标题、未知状态、无效 id 和数据库不可用时的 API 状态码及响应。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：把任务操作设计成 REST API](/notes/typescript-43-rest-api) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：日志与环境配置：启动就把问题暴露出来](/notes/typescript-45-logging-config)

