---
title: "TypeScript 学习笔记：目录与阅读路线"
date: "2026-11-12"
excerpt: "从点击新增任务到刷新后仍能找到它，前后端之间经过了哪些边界？按JavaScript执行、TypeScript检查、页面交互与持久化组织阅读路线，避免先背整套框架。"
tags: [ "TypeScript" ]
category: "typescript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

点击新增，任务在页面出现；刷新后还在，才说明数据已经走过前端状态、HTTP与数据库。再换一个用户，不能看到原用户任务，又多了一条身份边界。全栈学习可以沿这些可观察结果展开，不必先把框架名字全记住。

先理解JavaScript的对象、闭包与异步，再看TypeScript怎样描述代码关系；React管理页面状态，Express接住请求，PostgreSQL与Prisma保存事实。每增加一层，确认它收到什么、保证什么、失败留下什么，而不是把类型通过当作全程正确。

熟悉Python可以从05到12对照语言差异，已有前端经验则重点读14到31的类型与工程边界。做任务项目时从配套规格选一条最小读写路径，遇到状态或权限问题再回到相关章节，不需要等57篇全部背完才开始运行。

## Web 基础

[查看这个分类](/notes?category=typescript-01-web)

- [01 从 Python 转向 TypeScript，先分清运行环境](/notes/typescript-01-learning-route)
- [02 浏览器、API 与数据库之间发生了什么](/notes/typescript-02-web-architecture)
- [03 HTML、CSS 与 DOM：React 下面仍然是浏览器](/notes/typescript-03-html-css-dom)
- [04 读懂一次 HTTP 请求和 JSON 响应](/notes/typescript-04-http-json-api)

## JavaScript 语法

[查看这个分类](/notes?category=typescript-02-javascript)

- [05 JavaScript 变量：const 限制的到底是什么](/notes/typescript-05-values-and-variables)
- [06 判断、循环与默认值：0 和空字符串怎么办](/notes/typescript-06-control-flow)
- [07 数组与对象：选择、转换和浅拷贝](/notes/typescript-07-arrays-objects)
- [08 函数与闭包：函数记住了什么](/notes/typescript-08-functions-scope)
- [09 对象、原型与 class 的关系](/notes/typescript-09-object-model)

## JavaScript 异步与工具

[查看这个分类](/notes?category=typescript-03-js-engineering)

- [10 模块、Node.js 与 npm：让文件和依赖各归其位](/notes/typescript-10-modules-node-npm)
- [11 Promise 与事件循环：等待不等于阻塞线程](/notes/typescript-11-promises-event-loop)
- [12 fetch 的失败：网络、HTTP 和业务要分开处理](/notes/typescript-12-fetch-errors)
- [13 调试时，先找实际数据第一次变错的位置](/notes/typescript-13-debugging)

## TypeScript 类型基础

[查看这个分类](/notes?category=typescript-04-typescript-core)

- [14 TypeScript 的检查发生在什么时候](/notes/typescript-14-typescript-compiler)
- [15 类型推断、unknown、any 与函数边界](/notes/typescript-15-basic-types)
- [16 数组、元组和对象类型怎样表达约束](/notes/typescript-16-object-types)
- [17 函数类型：回调的输入、输出和异步性](/notes/typescript-17-function-types)
- [18 type、interface 与联合类型怎么配合](/notes/typescript-18-alias-interface-unions)

## 类型收窄与泛型

[查看这个分类](/notes?category=typescript-05-typescript-modeling)

- [19 类型收窄：检查怎样影响后面的代码](/notes/typescript-19-narrowing)
- [20 类型守卫与穷尽检查：把状态处理完整](/notes/typescript-20-type-guards)
- [21 泛型：保留输入与输出之间的关系](/notes/typescript-21-generics)
- [22 typeof、keyof 与索引访问：从现有声明推导类型](/notes/typescript-22-type-queries)

## 进阶类型

[查看这个分类](/notes?category=typescript-06-typescript-advanced)

- [23 映射类型与条件类型：类型也可以按规则变换](/notes/typescript-23-mapped-conditional-types)
- [24 工具类型、模板字面量与 satisfies](/notes/typescript-24-template-utility-types)
- [25 TypeScript 类：接口、抽象类与私有字段](/notes/typescript-25-typescript-classes)
- [26 声明文件：编译器从哪里认识一个 JavaScript 包](/notes/typescript-26-declarations)

## TypeScript 工程实践

[查看这个分类](/notes?category=typescript-07-typescript-engineering)

- [27 tsconfig 与 strict：每个检查选项在管什么](/notes/typescript-27-tsconfig-strict)
- [28 模块解析：编译通过之后为什么还会导入失败](/notes/typescript-28-module-resolution)
- [29 用 Zod 守住运行时输入边界](/notes/typescript-29-runtime-validation)
- [30 类型放在哪里：领域、API 与页面的区别](/notes/typescript-30-type-organization)
- [31 格式、Lint、类型检查和构建分别能证明什么](/notes/typescript-31-quality-tooling)

## React 组件

[查看这个分类](/notes?category=typescript-08-react)

- [32 建立 React 与 TypeScript 项目](/notes/typescript-32-react-project)
- [33 组件、Props 与组合：把输入和事件说清楚](/notes/typescript-33-components-props)
- [34 React 状态与列表更新](/notes/typescript-34-state-events)
- [35 Hooks：同步外部系统与复用组件逻辑](/notes/typescript-35-hooks)
- [36 把表单做完整：输入、错误、提交和键盘](/notes/typescript-36-forms-accessibility)

## 前端应用

[查看这个分类](/notes?category=typescript-09-frontend-app)

- [37 路由与页面：URL 怎样对应到组件](/notes/typescript-37-routing)
- [38 请求状态：空列表和加载失败不能混在一起](/notes/typescript-38-api-requests)
- [39 前端状态与缓存：谁拥有数据，何时更新](/notes/typescript-39-state-cache)
- [40 登录页面与受保护路由](/notes/typescript-40-auth-ui)

## Node.js 与 Express

[查看这个分类](/notes?category=typescript-10-backend)

- [41 Node.js 服务：配置、入口与进程生命周期](/notes/typescript-41-node-runtime)
- [42 Express 中间件：请求沿什么顺序被处理](/notes/typescript-42-express)
- [43 把任务操作设计成 REST API](/notes/typescript-43-rest-api)
- [44 输入校验与错误响应：在边界拒绝无效数据](/notes/typescript-44-validation-errors)
- [45 日志与环境配置：启动就把问题暴露出来](/notes/typescript-45-logging-config)

## 数据库与安全

[查看这个分类](/notes?category=typescript-11-database-security)

- [46 关系数据库与 SQL：从持久化到关联查询](/notes/typescript-46-sql)
- [47 用户与任务的数据关系怎么设计](/notes/typescript-47-data-modeling)
- [48 Prisma 建模与查询：类型之外仍有访问规则](/notes/typescript-48-prisma)
- [49 迁移、种子数据与事务：让数据变更能重现](/notes/typescript-49-migrations-transactions)
- [50 认证与授权：保护任务属于谁这件事](/notes/typescript-50-auth-security)

## 全栈整合与发布

[查看这个分类](/notes?category=typescript-12-delivery)

- [51 npm workspaces：组织前端、API 和共享包](/notes/typescript-51-workspaces)
- [52 共享 Schema：让前后端使用同一份接口规则](/notes/typescript-52-shared-contracts)
- [53 任务 API：把会话、校验和持久化连起来](/notes/typescript-53-task-api)
- [54 注册、登录、刷新与退出的完整流程](/notes/typescript-54-auth-integration)
- [55 单元和组件测试：把用户能观察到的行为写下来](/notes/typescript-55-unit-component-tests)
- [56 API 与端到端测试：确认整条路径能走通](/notes/typescript-56-api-e2e-tests)
- [57 构建与部署：把本机能跑变成可重复交付](/notes/typescript-57-deployment-capstone)

## 配套资料

- [TypeScript 任务管理项目：功能、接口与数据约定](/notes/typescript-task-project)
- [TypeScript 练习参考：57 个问题的实现思路](/notes/typescript-exercise-answers)
- [TypeScript 与全栈开发术语速查](/notes/typescript-glossary)

## 示例怎么运行

先安装受支持的 Node.js LTS，再按示例配置 JavaScript 和 TypeScript 工具。后端示例使用 Express 5；任务项目采用 React、PostgreSQL、Prisma 与共享 Zod Schema。局部片段需要结合前后文的类型和依赖使用。

完整组件与短片段会说明所需上下文，不能把事务内部语句当成独立入口。代码前先预测结果，运行后检查数据与失败路径，再改一个条件看原因；练习参考用于核对规则，不要求实现逐字一致。

这一系列提供讲解与分阶段练习，配套项目说明定义交付目标，不表示所有片段已经自动组成完整产品。最终在干净环境安装、迁移、启动、测试与构建，才能确认自己完成的那份应用真正可交付。

