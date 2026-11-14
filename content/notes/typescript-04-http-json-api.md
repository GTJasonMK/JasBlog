---
title: "TypeScript 04：读懂一次 HTTP 请求和 JSON 响应"
date: "2026-11-12"
excerpt: "404、网络中断与JSON解析失败，都叫请求失败吗？读一份创建任务请求，分清HTTP结果、内容格式和业务字段，再确定客户端下一步该做什么。"
tags: [ "TypeScript", "Web 基础" ]
category: "typescript-01-web"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

请求拿到404，说明收到了某个HTTP响应，可能来自应用，也可能来自代理；DNS失败则连这样的响应都没有。两者都可能让页面加载失败，排查路径却不同。先把通信、状态与内容分开读。

HTTP 请求由方法、路径、头部和可选请求体组成；响应包含状态码、头部和可选响应体。JSON 是常见数据格式，但 JSON 本身没有日期、函数或 TypeScript 类型。

~~~http
POST /api/tasks
Content-Type: application/json

{"title":"学习 HTTP","status":"todo"}
~~~

常见方法：GET 读取、POST 创建、PATCH 局部修改、DELETE 删除。常见状态码：200 成功、201 已创建、204 无响应体成功、400 输入错误、401 未登录、403 无权限、404 不存在、500 服务端错误。

Content-Type说明请求体按什么格式解释，JSON字符串不等于已经解析的对象。属性名和字符串使用双引号，不能直接传函数、undefined或Date对象；Date通常序列化为约定的时间字符串，读取后也不会自动恢复日期行为。

创建接口返回201与任务对象，客户端可以取得正式编号；204表示成功且没有响应体，不能继续无条件调用json解析。错误响应也可能是HTML页面，所以“状态检查通过以后再按合同解析”与“解析失败处理”都要保留。

## 字段类型之外还缺什么

任务status是字符串，不意味着任何字符串都合法。接口应固定可选值、标题长度、时间格式与缺失含义。PATCH中省略title表示保留，传null能否清除则由合同定义；不能把所有假值都当作没提供。

列表还应约定排序与分页上限。否则客户端看到数组，无法知道是完整结果还是默认第一页。请求参数通常先以文本进入API，页码需要显式解析并检查整数与范围。

## HTTP 错误和网络错误要分开

- 收到404后检查响应来源与实际路径，不能据此断言业务Handler已经执行。
- JSON 字符串中的属性名和字符串值都使用双引号。
- 状态码要表达结果，响应体提供可操作的细节。

超时则带来另一种问题：服务端可能已创建任务，只是确认没返回。重复请求会不会重复创建，需要幂等或可查询身份，不能用一个前端try/catch决定。HTTP方法表达语义，业务还要实现对应行为。

## 动手验证

设计一个“获取任务列表”的请求和响应 JSON，并写出未登录时合理的状态码。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：HTML、CSS 与 DOM：React 下面仍然是浏览器](/notes/typescript-03-html-css-dom) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：JavaScript 变量：const 限制的到底是什么](/notes/typescript-05-values-and-variables)

