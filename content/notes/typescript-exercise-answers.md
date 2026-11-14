---
title: "TypeScript 练习参考：57 个问题的实现思路"
date: "2026-11-11"
excerpt: "练习结果相同，是否就算做对了？按57个问题核对输入、状态、错误与权限，并补上判断依据，帮助区分正常样本跑通与规则真正成立。"
tags: [ "TypeScript" ]
category: "typescript"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-11
---

先自己写出预期，再对照编号检查。答案是可接受思路，函数拆法与变量名可以不同；关键在于非法输入是否被拒绝、状态是否一致、资源是否按身份隔离。只得到同一份正常输出，还没有验证这些边界。

## 第一篇：学习准备与 Web 基础

这组先验证执行位置与数据流。浏览器显示内容、HTTP得到成功与数据库提交是不同观察，解释时能指出各自发生在哪一步。

1. 使用 Node 中的 process.version 输出版本。相对路径从当前工作目录解析，切换目录后文件可能找不到。
2. 用户点击 → 前端 POST JSON → API 校验会话与请求 → 数据库写入 → API 返回 201 → 页面更新。登录检查在 API。
3. 使用 label 和 id 关联标题、select 与按钮；每个控件都有可见标签，按钮明确 type。
4. GET /api/tasks 返回任务数组；未登录访问受保护接口应返回 401。

## 第二篇：JavaScript 核心语法

重点追踪绑定、对象身份与函数环境。修改副本以后也检查原对象，创建两个闭包实例以后也检查彼此独立，才能排除碰巧输出正确。

5. const 配置对象可修改属性但不能重新赋值；let 计数器可重新赋值。const 限制绑定，不冻结对象。
6. 先确认page与pageSize都是整数，再限制page至少1、pageSize在1到100；NaN、小数与文本都拒绝。URL文本在边界另行解析，默认值只处理允许省略的情况。
7. 先 filter 出 status 不为 done 的任务，再用 map 复制对象并替换 title；原数组和对象不变。
8. 闭包保存调用次数；前三次返回次数，后续返回 limit。每次 makeCounter 应有独立计数。
9. complete 将 done 设为 true，reopen 设回 false。若没有复杂不变量，普通对象和纯函数也足够。

## 第三篇：JavaScript 异步与开发工具

先确定Promise代表哪项工作，调用方是否真正等待，再分别制造HTTP错误、网络拒绝和格式错误。不要让所有失败都退成空数组。

10. 在模块中导出筛选函数，在另一个模块 import 后传入任务列表；脚本放入 package.json scripts。
11. 用 Promise.all 同时启动两个请求，再 await 结果；try/catch 捕获任一拒绝。
12. 先按端点合同检查状态；允许204时不解析正文，原本要求任务对象却得到204则明确协议错误。非2xx读取约定错误结构，fetch拒绝还可能来自取消或非法调用，不能一概当成网络中断。
13. Network 面板应显示错误路径和 404 响应；恢复路径后再次请求应得到预期状态码。

## 第四篇：TypeScript 类型基础

用真实tsc检查合法与非法赋值，再运行合法示例。编译拒绝说明静态合同有效，不说明外部JSON已经被验证。

14. 给 number 参数传 string 应编译失败；删除独立函数的参数类型后，TypeScript 不会从调用点反向推断参数类型。strict 模式下会报隐式 any 错误；关闭 noImplicitAny 时该参数才会落为 any。
15. 先用 typeof 检查值是 number；否则返回明确错误结果或抛出 TypeError。
16. Task 的字段类型分别是 string、TaskStatus 和可选 Date；读取 title 返回 string。
17. 比较器返回两个标题长度之差；sortTasks 用它对副本排序。
18. 状态可用字符串联合；响应可表示为成功含 data 或失败含 message 的判别联合。

## 第五篇：类型收窄与泛型

每个分支说出排除了什么可能；泛型则说出哪两个位置的类型仍有关联。需要as才能继续时，检查证据是否真的存在。

19. null先返回空文本，其余按typeof格式化。数值展示可以明确保留小数位，真实编号不能用会舍入的格式化操作处理。
20. 用 kind 字段区分状态，switch 覆盖所有成员并在 default 赋给 never。
21. 定义约束 T extends { id: string }，find 函数返回 T 或 undefined。
22. statuses 用 as const 保留字面量，(typeof statuses)[number] 得到状态联合。

## 第六篇：TypeScript 进阶类型

类型工具分别用简单对象、联合与空值检验推导结果；readonly和satisfies不生成运行时冻结或校验。Clock测试控制时间输入，不修改真实系统时间。

23. 映射键并对每个属性加 readonly 修饰符；检查赋值时应触发只读错误。
24. TaskUpdate 只选允许修改的业务字段；EventKey 使用模板字面量把 EventName 与 EventAction 组合。satisfies 检查对象形状但保留具体推断。
25. 固定时钟实现 now 并返回固定 Date；业务函数接收 Clock，测试时注入固定实现。
26. 从 node_modules 中找到包的声明入口，查看导出函数声明和类型定义。

## 第七篇：TypeScript 工程实践

检查器、打包器与生产运行入口都实际走一次。一个工具能找到路径，不代表另一个工具采用同样的解析规则。

27. strict 下未标注参数通常报隐式 any；nullable 值必须判空。noUnusedLocals 和 noUnusedParameters 需单独启用，打开后未使用声明会报错。
28. 记录浏览器由 Vite 解析打包、Node 由 package.json 与运行时模块模式解析；确保开发和生产均能加载。
29. trim 后对空白标题拒绝；长度大于上限也拒绝；有效标题返回解析后的规范化值。
30. 数据库记录有 ownerId 与时间戳；创建输入不应有 id、ownerId；列表响应只暴露前端所需字段。
31. typecheck 和 build 脚本调用 tsc 与构建工具；制造类型错误后命令应退出非零。

## 第八篇：React 与组件开发

渲染后通过标签与角色操作，检查只更新目标项、失败保留草稿、旧请求不覆盖新状态。Props与回调名称必须和实际组件一致。

32. 首页渲染静态任务列表；npm run build 应生成生产静态资源。
33. TaskCard 接收 title、status、onOpen；空描述显示明确占位，不直接修改 Props。
34. 使用 map 创建新数组，只替换 id 匹配的任务；其他任务引用保持不变。
35. Hook 返回 state、error、loading 和 refresh；页面调用接口而不关心请求实现细节。
36. 空标题时显示关联错误并阻止提交；有效标题可用键盘提交；提交中禁用重复操作。

## 第九篇：前端应用结构

直接打开与站内导航分别测试，会话未确认与匿名分别呈现。缓存更新以后，从详情回到列表再刷新，检查数据来源确实统一。

37. /tasks/:taskId 对应详情页；读取参数后校验格式，再请求 API。
38. 页面至少区分 loading、ready-empty、ready-with-data 和 error；重试再次发起请求。
39. 新增时显示提交状态；成功后用 API 返回数据更新列表或重新加载；失败保留草稿。
40. 登录状态由当前用户 API 初始化；刷新后仍可恢复，退出调用服务端并清除界面状态。

## 第十篇：Node.js 与 Express 后端

服务入口先校验配置，再组装应用；路由片段放在认证与解析之后。输入错误、缺失资源和系统失败应有不同结果，不通过空catch掩盖。

41. 从环境读取 PORT，转成整数并校验合法范围；缺失或非法时启动失败并指出配置名。
42. 日志记录 method、path、status、耗时；过滤 Cookie、Authorization 和请求体秘密字段。
43. 列表 GET 200；创建 POST 201；详情 GET 200/404；修改 PATCH 200/404；删除 DELETE 204/404。
44. 空标题、未知状态和无效 id 返回 400；未捕获数据库故障返回 500 并记录服务端错误。
45. 必需变量缺失时启动校验失败；不要使用空连接串或固定会话密钥回退。

## 第十一篇：数据库、认证与安全

用独立数据库验证约束，两个独立会话验证授权。内存替身不能证明外键、事务隔离与实际SQL范围。

46. 按owner_id与未完成状态过滤，使用created_at DESC、id DESC稳定排序并LIMIT 20；值参数绑定，NULL状态是否允许由模型先决定。
47. User.id 是主键；Task.owner_id 是非空外键；email 唯一。用户删除可限制删除或显式级联，需选定并测试。
48. Prisma 查询用 where.ownerId 过滤，select 仅包含 id、title、status；不存在时返回 null。
49. 新字段可用有意义的默认值迁移旧行；生成迁移并在测试库验证，不重置生产库。
50. 以用户 A 会话请求用户 B 的任务，应返回 404 或统一权限错误；Cookie 使用 HttpOnly、Secure（HTTPS）与适当 SameSite。

## 第十二篇：全栈整合、测试与发布

共享规则后仍分别验证前端反馈和API真实输入，构建以后仍执行生产入口。测试数据与真实用户数据隔离，检查失败要阻止继续发布。

51. 根 package.json 声明 apps/* 与 packages/* workspaces；shared 导出常量，web/api 声明 workspace 依赖。
52. 创建和修改分别用 Zod Schema；API parse 请求，前端推导类型；修改 Schema 限定字段白名单。
53. 列表和单条读写都带当前用户 id 条件；测试两个用户间互相不可见。
54. 注册后登录写 Cookie；刷新调用 /auth/me 恢复用户；退出销毁会话并清 Cookie。
55. 对36章TaskForm检查createTask调用：空白标题不调用，合法输入提交规范化title与status为todo，提交中重复事件仍只调用一次，失败保留草稿，成功清空。
56. Supertest 验证未登录 401 和越权隔离；Playwright 登录后创建任务并在列表看到。
57. 在干净环境按 README 安装、设置环境变量、迁移、启动、测试和构建；缺的步骤补回 README。

