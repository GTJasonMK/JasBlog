---
title: "TypeScript 52：共享 Schema：让前后端使用同一份接口规则"
date: "2026-11-12"
excerpt: "请求类型写一份、校验规则再写一份，修改时就可能遗漏。我会从 Schema 推导类型，让前端反馈和后端校验使用同一份约定，同时保持后端独立执行检查。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

请求类型写一份、校验规则再写一份，修改时就可能遗漏。我会从 Schema 推导类型，让前端反馈和后端校验使用同一份约定，同时保持后端独立执行检查。

在 shared 中定义请求和响应 Schema。API 使用 parse 或 safeParse 验证真实请求；前端可使用同一 Schema 做即时表单反馈；类型从 Schema 推导，避免另外维护一份手写接口类型。

~~~ts
import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  status: z.enum(["todo", "in_progress", "done"]),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
~~~

共享契约代表公开 API，不应包含数据库私有字段。响应 Schema 也需要校验或由服务端可靠映射，避免意外泄露字段。

## 共享规则不等于只校验一次

- 前端 Schema 校验不能代替后端校验。
- 服务端输出不应直接序列化数据库模型。
- API 变更要考虑前后端部署版本短暂不一致。

## 动手验证

为任务创建和修改分别定义 Schema；创建需要 title，修改只允许更新白名单字段。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：npm workspaces：组织前端、API 和共享包](/notes/typescript-51-workspaces) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：任务 API：把会话、校验和持久化连起来](/notes/typescript-53-task-api)

