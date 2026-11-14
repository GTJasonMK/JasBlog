---
title: "TypeScript 40：登录页面与受保护路由"
date: "2026-11-12"
excerpt: "页面刚打开时，内存里的用户状态还不能说明是否已经登录。我会先向当前用户接口确认会话，再决定显示内容或引导登录，避免刷新时短暂跳错页面。"
tags: [ "TypeScript", "前端应用" ]
category: "typescript-09-frontend-app"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

页面刚打开时，内存里的用户状态还不能说明是否已经登录。我会先向当前用户接口确认会话，再决定显示内容或引导登录，避免刷新时短暂跳错页面。

页面打开时调用当前用户 API，得到已登录或未登录状态。登录成功后刷新用户状态并导航到任务页；退出时清除 UI 状态并调用服务端退出接口。使用 Cookie 会话时，浏览器在同源请求中自动发送 Cookie。

受保护路由只改善体验：未登录时引导去登录页。真正的权限仍必须由 API 验证。

## 会话状态需要从服务端恢复

- 不要把密码或会话秘密存入 localStorage。
- 页面刷新后不能只靠 React 内存状态判断登录。
- 加载当前用户期间，不要闪现受保护页面或错误重定向。

## 动手验证

实现登录、刷新页面保持会话、退出三条流程；手动访问任务 API 验证服务端仍会检查身份。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：前端状态与缓存：谁拥有数据，何时更新](/notes/typescript-39-state-cache) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：Node.js 服务：配置、入口与进程生命周期](/notes/typescript-41-node-runtime)

