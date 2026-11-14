---
title: "TypeScript 56：API 与端到端测试：确认整条路径能走通"
date: "2026-11-12"
excerpt: "单元测试之外，我还会检查真实请求、数据库约束和浏览器流程。尤其用两个用户做隔离测试，才能确认权限规则确实落实在 API 中。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

单元测试之外，我还会检查真实请求、数据库约束和浏览器流程。尤其用两个用户做隔离测试，才能确认权限规则确实落实在 API 中。

Supertest 可直接对 Express 应用发请求。API 测试应覆盖有效输入、无效输入、未认证、越权和数据库约束。测试数据库与开发数据库隔离，并在每次测试后清理数据。

Playwright 从真实浏览器验证关键流程，如注册、登录、创建任务和退出。E2E 测试少而关键，细节逻辑放在更快的单元或 API 测试中。

## 测试环境必须与真实用户数据隔离

- 不要让测试写入真实生产数据库。
- 测试通过不能证明所有安全问题不存在。
- E2E 失败时先区分应用故障、环境故障和选择器不稳定。

## 动手验证

编写三类检查：未登录访问任务返回 401；用户 A 无法读取用户 B 的任务；浏览器登录后可新增并看到任务。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：单元和组件测试：把用户能观察到的行为写下来](/notes/typescript-55-unit-component-tests) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：构建与部署：把本机能跑变成可重复交付](/notes/typescript-57-deployment-capstone)

