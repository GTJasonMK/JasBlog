---
title: "TypeScript 45：日志与环境配置：启动就把问题暴露出来"
date: "2026-11-12"
excerpt: "数据库地址或会话密钥缺失时，我宁愿服务启动就失败，也不想等到某次请求才报一个含糊的错误。日志则负责补上上下文，同时避开凭证和敏感请求数据。"
tags: [ "TypeScript", "Node.js 与 Express" ]
category: "typescript-10-backend"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

数据库地址或会话密钥缺失时，我宁愿服务启动就失败，也不想等到某次请求才报一个含糊的错误。日志则负责补上上下文，同时避开凭证和敏感请求数据。

启动时校验必需环境变量，例如数据库连接串、端口和会话密钥；缺少配置时直接报出变量名并停止启动。开发、测试和生产配置分开管理。

Node.js 进程不会因为存在 .env 文件就自动加载它。开发脚本要明确使用 Node 的 --env-file 参数或 dotenv 等加载方式；生产通常由进程管理或部署平台注入环境变量。

请求日志应含时间、方法、路径、状态码和耗时，可用请求 id 关联前后端排查。不要记录密码、Cookie、Authorization 头或完整敏感请求体。

生产日志输出到标准输出，由进程管理或平台收集。日志级别应能区分调试、一般信息、警告和错误。

## 必需配置不能悄悄换成空值

- 配置解析不要默默使用空字符串或不安全默认密钥。
- 日志不能代替用户可见错误响应，也不能记录秘密。
- 记录请求路径前应避免把敏感查询参数写入日志。

## 动手验证

列出任务项目启动所需环境变量；缺少 DATABASE_URL 时让进程明确失败。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：输入校验与错误响应：在边界拒绝无效数据](/notes/typescript-44-validation-errors) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：关系数据库与 SQL：从持久化到关联查询](/notes/typescript-46-sql)

