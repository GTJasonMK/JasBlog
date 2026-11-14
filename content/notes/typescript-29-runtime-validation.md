---
title: "TypeScript 29：用 Zod 守住运行时输入边界"
date: "2026-11-12"
excerpt: "外部数据进入程序时，我会先把它当作未知值，再通过 Schema 得到已经校验的结果。这样后面的业务函数就不用到处重复猜测字段是不是存在。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

外部数据进入程序时，我会先把它当作未知值，再通过 Schema 得到已经校验的结果。这样后面的业务函数就不用到处重复猜测字段是不是存在。

TypeScript 类型在运行时不存在。HTTP 请求、环境变量和数据库数据都可能缺失或不符合预期。Zod Schema 能检查真实值，并从规则推导 TypeScript 类型。

~~~ts
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  status: z.enum(["todo", "in_progress", "done"]),
});

type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
const input = CreateTaskSchema.parse(requestBody);
~~~

parse 校验失败会抛出结构化错误；safeParse 返回成功或失败的结果，可用于统一 API 错误响应。

## 断言不会执行输入校验

- 类型断言不会替代 parse。
- 只在前端校验不够，服务端必须独立验证输入。
- 校验规则应集中维护，避免客户端与服务端长期漂移。

## 动手验证

给任务标题增加 trim、最小长度和最大长度；测试空字符串、纯空格和超长输入。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：模块解析：编译通过之后为什么还会导入失败](/notes/typescript-28-module-resolution) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：类型放在哪里：领域、API 与页面的区别](/notes/typescript-30-type-organization)

