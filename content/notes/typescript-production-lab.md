---
title: "TypeScript 完整实作：多用户任务系统与交付"
date: "2026-11-15"
excerpt: "沿固定版本完整工程解释业务边界、失败处理与验证，区分本地实测、配置检查和待运行场景。"
tags: ["TypeScript", "工程实践"]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: "2026-11-15"
---

[下载 0.1.1 版完整源码](/downloads/jas-learning-v0.1.1.zip)，解压后从项目根目录按步骤运行。[版本与校验信息](/downloads/jas-learning-v0.1.1.json)。

任务出现以后，刷新要保留，另一用户不能按编号修改它，网络失败也应留下草稿。工程将这些要求接到同一条浏览器、API 和 PostgreSQL 路径上。版本为 0.1.0。

## 从干净环境启动

从 JasLearning 根目录启动 PostgreSQL，再安装、构建和迁移：

```bash
python3 scripts/services.py start postgres
cd typescript
npm ci
npm run build
cd ..
python3 scripts/services.py run -- npm --prefix typescript exec -w @learning/api -- prisma migrate deploy
python3 scripts/services.py run -- node typescript/apps/api/dist/server.js
```

另一个终端在 typescript 目录执行 `npm run dev -w @learning/web`，打开 http://localhost:5173。开发代理转发 /api，浏览器使用同源 Cookie。密码至少 12 个字符，邮箱可使用虚构的 example.invalid 地址。

本版本固定 Prisma 7.10.1：连接地址放在 prisma.config.ts，应用通过 PrismaPg 使用 pg 驱动，生成代码位于 API 的 src/generated。旧文章中 Prisma 6 的写法保留其版本条件，不能与 v7 初始化方式混用。

## 一份合同怎样穿过前后端

packages/shared/src/index.ts 定义创建、PATCH、任务响应与分页 Schema。创建只接纳标题、描述、状态与截止时间；归属和编号由服务器产生。PATCH 省略表示保留，description 与 dueAt 的 null 表示清除，空 PATCH 被拒绝。

web 和 api 通过包名使用公开入口，shared 不导入数据库、会话或密码实现。先构建 shared 再构建消费者，避免本机能解析源码、部署时却缺少包产物。TypeScript 类型不验证网络 JSON，API 仍需解析 Schema，数据库仍需唯一键和外键。

## 身份和归属落实到实际读写

apps/api/src/app.ts 创建 Express、Prisma 和 PostgreSQL 会话存储。登录验证 Argon2id 哈希后更新会话标识，等待存储完成，再发送 HttpOnly Cookie。生产启用 Secure 与 HTTPS，写入检查 Origin，可信代理范围按实际网络配置。

列表按 ownerId 过滤，详情、修改和删除同时带任务 id 与当前身份。测试在越权请求返回 404 后独立查询数据库，确认没有被修改。注册依靠邮箱唯一约束，提前查询不能消除并发竞争。

分页使用 createdAt 与 id 的稳定次序，游标先检查归属，再继续读取。无效游标明确失败，不悄悄回到第一页。错误返回稳定 code，系统故障不伪装成空列表。

apps/api/src/server.ts 启动时检查配置和表结构。SIGTERM 后先停止接新请求，等待在途请求，再关闭会话池和 Prisma；超过关闭预算时报告失败。

## 页面状态也是合同

apps/web/src/main.tsx 分别保存加载、空列表、失败和编辑草稿。保存失败保留输入；401 转到重新登录，同一用户恢复编辑，换用户则清除原草稿。datetime.ts 连接本地时间控件与带时区的接口值，未改时间时保留原秒和毫秒。

原生 dialog 提供模态焦点和 Escape，页面只有新增任务一个主要入口。窄屏操作换行，长标题和邮箱完整显示，业务规则由校验及失败反馈体现。

## 执行验证

从 JasLearning 根目录运行：

```bash
python3 scripts/services.py run -- npm --prefix typescript test
python3 scripts/services.py run -- env CHROME_PATH=/usr/bin/chromium npm --prefix typescript run test:browser
```

不用系统 Chromium 时，在 typescript 目录运行 npx playwright install chromium，然后省略 CHROME_PATH。API 测试创建自己的数据库，覆盖未认证、双用户越权、坏字段、会话撤销与最终数据。浏览器验证创建、刷新、错误草稿、时间保留、会话恢复、删除和退出，并检查三种宽度。

在 typescript 目录执行 npm run lint、npm run build 和 npm audit。构建、API 和浏览器验证提供不同证据。

## 发布和恢复

Dockerfile 的 api、web、migrate 是独立构建目标。API 使用移除开发依赖后的编译产物，迁移镜像保留 Prisma CLI；web 提供静态产物，/api 错误不会被 SPA fallback 变成 HTML。Kubernetes 中先完成迁移 Job，再发布应用，字段与执行顺序见公共配置讲解。

生产使用分别授权的迁移账号和 API 账号、独立会话密钥、HTTPS 与备份。回滚应用前检查数据库兼容性，删除列以后只换旧镜像不能恢复数据。完成一次兼容字段变更、中断与恢复记录，才通过发布阶段。


[系列目录](/notes/typescript-00-learning-guide) · [Kubernetes 配置](/notes/go-kubernetes-lab)
