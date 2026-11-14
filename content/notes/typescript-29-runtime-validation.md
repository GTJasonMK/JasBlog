---
title: "TypeScript 29：用 Zod 守住运行时输入边界"
date: "2026-11-12"
excerpt: "标题全是空格，string类型为什么没拦住？把未知请求交给Zod，按先trim再检查的顺序得到规范化输入，让静态类型来自实际解析规则。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

title是string，三个空格也符合这个类型，但不应该成为任务标题。TypeScript无法判断网络实际送来什么，业务还需要规范化、长度和状态名单这些运行时规则。Schema把检查与得到的值放在一个入口。

TypeScript 类型在运行时不存在。HTTP 请求、环境变量和数据库数据都可能缺失或不符合预期。Zod Schema 能检查真实值，并从规则推导 TypeScript 类型。

~~~ts
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  status: z.enum(["todo", "in_progress", "done"]),
}).strict();

type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

function parseCreateTask(value: unknown): CreateTaskInput {
  return CreateTaskSchema.parse(value);
}

const input = parseCreateTask({ title: "  读书  ", status: "todo" });
~~~

parse 校验失败会抛出结构化错误；safeParse 返回成功或失败的结果，可用于统一 API 错误响应。

先安装zod。输入经过trim以后才检查最短长度，所以纯空格会被拒绝，合法标题则返回去掉两端空白的结果。调用方使用parse返回值，不能校验了一遍却继续保存原始requestBody，否则规范化成果没有进入业务。

strict拒绝未声明字段，避免请求混入id或ownerId还被悄悄接纳。也可以按合同选择移除未知字段，但策略要统一并写进测试；不能一条接口拒绝，另一条把整份对象直接交给数据库。

z.infer从Schema推导结果类型，若有转换，输入类型与输出类型还可能不同。内部函数接收已解析值，避免每层重复trim与猜测；HTTP、配置和其他外部入口则各自完成必要解析。

## 断言不会执行输入校验

- 类型断言不会替代 parse。
- 只在前端校验不够，服务端必须独立验证输入。
- 校验规则应集中维护，避免客户端与服务端长期漂移。

前端复用Schema给用户及时反馈，服务端对真实请求独立parse。Schema不能证明用户有权创建、活动仍开放或任务属于当前身份，这些需要业务与权限检查。分清字段有效与操作允许，才能知道规则应该放在哪个边界。

测试空文本、纯空白、121字符、未知status、额外id与合法输入，并检查合法值真的返回规范化title。parse失败映射到明确客户端错误，内部异常仍保留为服务端失败，不把所有throw都解释成用户填错。

## 动手验证

给任务标题增加 trim、最小长度和最大长度；测试空字符串、纯空格和超长输入。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：模块解析：编译通过之后为什么还会导入失败](/notes/typescript-28-module-resolution) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：类型放在哪里：领域、API 与页面的区别](/notes/typescript-30-type-organization)

