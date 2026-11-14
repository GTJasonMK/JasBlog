---
title: "TypeScript 任务管理项目：功能、接口与数据约定"
date: "2026-11-11"
excerpt: "我用一个任务管理应用贯穿前后端示例。先把功能、用户边界和数据合同写清楚，再逐步接上页面、会话和数据库，便于判断每个实现片段应该放在哪里。"
tags: [ "TypeScript" ]
category: "typescript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-11
---

我用一个任务管理应用贯穿前后端示例。先把功能、用户边界和数据合同写清楚，再逐步接上页面、会话和数据库，便于判断每个实现片段应该放在哪里。

## 功能边界

- 用户可以注册、登录和退出。
- 登录用户可以创建、查看、修改和删除自己的任务。
- 未登录时不能访问任务接口；用户不能读取或修改其他用户的任务。
- 页面展示加载、空列表、成功和失败状态。

## 核心数据

- User：id、email、passwordHash、createdAt。
- Task：id、ownerId、title、description、status、dueAt、createdAt、updatedAt。
- status 只允许 todo、in_progress、done；description 与 dueAt 可为空。

密码只保存经过安全哈希处理的结果。数据库里不要保存明文密码。

## 建议 API

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录并建立会话 |
| POST | /api/auth/logout | 退出并清除会话 |
| GET | /api/auth/me | 获取当前登录用户 |
| GET | /api/tasks | 获取当前用户的任务 |
| POST | /api/tasks | 创建任务 |
| GET | /api/tasks/:id | 获取单个任务 |
| PATCH | /api/tasks/:id | 修改任务 |
| DELETE | /api/tasks/:id | 删除任务 |

任务查询必须同时包含任务 id 和当前用户 id。不要先按 id 查询后再依赖前端隐藏他人的数据。

## 代码结构

~~~text
apps/
  web/       React + Vite
  api/       Express API and prisma/schema.prisma
packages/
  shared/    Zod Schema 和推导出的类型
~~~

使用 npm workspaces 管理本地依赖。开发环境让 Vite 将 /api 请求代理给 Express，避免初学阶段混入不必要的跨域配置。

## 关键约定

- API 请求和响应由 shared 中的 Zod Schema 定义；API 收到数据时做运行时校验。
- 登录使用服务端会话和 HttpOnly Cookie。生产环境使用 HTTPS，并设置 Secure 与合适的 SameSite 属性。
- 生产默认使用 PostgreSQL 持久化会话存储，不使用 Express 默认 MemoryStore；登录时更新会话标识并设置过期时间。
- Cookie 写入请求检查 Origin；需要跨站 Cookie 时增加 CSRF Token 防护。
- 密码使用 Argon2id 等经过维护的密码哈希实现；登录、注册和密码重试需要限速。
- 数据库操作通过 Prisma；迁移由 Prisma 管理。
- 关键错误返回明确 HTTP 状态码和稳定的错误结构；不把堆栈或密码等敏感信息返回给浏览器。

## 验收清单

- 新用户可注册、登录、查看当前用户并退出。
- 未登录请求任务 API 得到 401；越权访问他人任务得到 404 或统一权限错误。
- 无效输入得到可理解的 4xx 响应，数据库不被写入错误数据。
- 浏览器可完成任务 CRUD，并呈现加载、空数据和失败状态。
- 类型检查、单元测试、API 测试、关键端到端流程和生产构建均可通过。

