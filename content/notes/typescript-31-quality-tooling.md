---
title: "TypeScript 31：格式、Lint、类型检查和构建分别能证明什么"
date: "2026-11-12"
excerpt: "编辑器没有红线，只能说明当前看到的部分没有报错。我会让命令行依次验证排版、静态规则、类型、测试和打包，每一步都保留清楚的失败结果。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

编辑器没有红线，只能说明当前看到的部分没有报错。我会让命令行依次验证排版、静态规则、类型、测试和打包，每一步都保留清楚的失败结果。

格式化统一代码排版；Lint 检查可疑或不一致写法；TypeScript 检查静态类型；构建验证代码是否可被目标工具打包。它们发现的问题不同，不能互相替代。

项目应提供清楚的 npm scripts，例如 dev、typecheck、lint、test、build。CI 或提交前执行同一套命令，避免“本机能跑、构建失败”。

## 不同检查不能互相代替

- 只看编辑器没有红线，不代表 CI 和生产构建会通过。
- 跳过失败检查会把错误留给后续阶段。
- 自动修复前先了解规则影响，避免大面积无关格式变化。

## 动手验证

为一个小项目添加 typecheck 与 build 脚本；故意制造类型错误，确认检查脚本以非零状态退出。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：类型放在哪里：领域、API 与页面的区别](/notes/typescript-30-type-organization) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：建立 React 与 TypeScript 项目](/notes/typescript-32-react-project)

