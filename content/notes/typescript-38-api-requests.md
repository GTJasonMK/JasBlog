---
title: "TypeScript 38：请求状态：空列表和加载失败不能混在一起"
date: "2026-11-12"
excerpt: "页面没有显示任务时，我希望能明确知道是还在加载、确实为空，还是请求失败。用一组互斥状态描述这些情况，比维护几个容易矛盾的布尔值更清楚。"
tags: [ "TypeScript", "前端应用" ]
category: "typescript-09-frontend-app"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

页面没有显示任务时，我希望能明确知道是还在加载、确实为空，还是请求失败。用一组互斥状态描述这些情况，比维护几个容易矛盾的布尔值更清楚。

请求函数负责协议细节，页面负责展示状态。请求结果应使用明确的联合类型，避免用多个布尔值组合出不可能状态。

~~~ts
type LoadState<T> =
  | { kind: "loading" }
  | { kind: "ready"; data: T }
  | { kind: "error"; message: string };
~~~

检查 response.ok，解析错误结构；处理取消请求和组件卸载。用一个小型 API client 统一 base path、credentials 和错误解析，但不要隐藏关键失败。

## 保留失败，才能决定下一步怎么做

- fetch 不会因为 404 自动抛错。
- 服务端返回结构要在边界验证，不能假定 JSON 一定符合类型。
- 不要把请求错误静默改成空列表，避免假成功界面。

## 动手验证

实现任务列表加载状态，区分空数据和加载失败，并提供重试按钮。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：路由与页面：URL 怎样对应到组件](/notes/typescript-37-routing) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：前端状态与缓存：谁拥有数据，何时更新](/notes/typescript-39-state-cache)

