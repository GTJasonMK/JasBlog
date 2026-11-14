---
title: "TypeScript 30：类型放在哪里：领域、API 与页面的区别"
date: "2026-11-12"
excerpt: "数据库记录、创建请求和列表响应都可以叫 Task，但它们需要的字段并不相同。我会按归属分别定义，只把真正需要共享的接口规则放进 shared。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

数据库记录、创建请求和列表响应都可以叫 Task，但它们需要的字段并不相同。我会按归属分别定义，只把真正需要共享的接口规则放进 shared。

类型放在拥有它的领域模块附近；只在多个包需要同一个契约时才提升到 shared。数据库模型、API DTO 和页面视图模型目的不同，不应为了少写代码强行共用一个类型。

共享 API Schema 可同时作为运行时校验和静态类型来源。内部实现类型不应通过公共入口全部导出。

## 共享类型不能抹掉业务边界

- 一个巨大 types.ts 会让领域边界消失。
- 重复复制请求类型容易漂移；可从 Schema 推导。
- 把 Prisma 数据模型直接返回给前端会暴露内部字段并耦合数据库结构。

## 动手验证

为 Task 划分数据库记录、创建请求和列表响应；列出三者不同的字段。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：用 Zod 守住运行时输入边界](/notes/typescript-29-runtime-validation) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：格式、Lint、类型检查和构建分别能证明什么](/notes/typescript-31-quality-tooling)

