---
title: "TypeScript 39：前端状态与缓存：谁拥有数据，何时更新"
date: "2026-11-12"
excerpt: "缓存的难点往往在写入之后。我会先确定任务列表的来源，再规定新增、修改和删除后怎样更新它，避免页面留着几份互相不同步的副本。"
tags: [ "TypeScript", "前端应用" ]
category: "typescript-09-frontend-app"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

缓存的难点往往在写入之后。我会先确定任务列表的来源，再规定新增、修改和删除后怎样更新它，避免页面留着几份互相不同步的副本。

输入框草稿、展开状态适合组件本地状态；跨页面共享的登录用户可由 Context 提供；任务数据来源于服务端，页面应有明确的加载、刷新和过期策略。

缓存能减少重复请求，但也产生失效问题。创建、修改、删除后要更新本地数据或重新请求。初版项目先用简单 Hook 和明确刷新动作，不引入复杂缓存库。

避免同时维护“服务端任务列表”和多份可编辑副本。表单提交前可保留草稿，成功后以服务端响应为准。

组件重新渲染通常是正常过程。先用 React DevTools 或 Profiler 找到实际瓶颈，再考虑 memo、useMemo 和 useCallback；不要把它们当成默认写法。大型页面可用 lazy 与 Suspense 延迟加载路由，但要提供加载反馈。

## 状态的归属和失效时机要明确

- 全局状态不等于所有状态都应该全局化。
- 缓存过期与数据一致性要明确。
- Context 更新会使使用它的组件重新渲染，注意状态边界。

## 动手验证

为新增任务流程画出草稿、提交中、成功和失败状态，并说明任务列表何时刷新。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：请求状态：空列表和加载失败不能混在一起](/notes/typescript-38-api-requests) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：登录页面与受保护路由](/notes/typescript-40-auth-ui)

