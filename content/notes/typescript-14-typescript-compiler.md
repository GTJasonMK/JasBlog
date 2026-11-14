---
title: "TypeScript 14：TypeScript 的检查发生在什么时候"
date: "2026-11-12"
excerpt: "TypeScript 能提前检查很多误用，但运行时拿到的 JSON 并不会带着类型一起到来。我会把静态检查和真实输入校验分开，分别交给编译器和边界解析代码。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

TypeScript 能提前检查很多误用，但运行时拿到的 JSON 并不会带着类型一起到来。我会把静态检查和真实输入校验分开，分别交给编译器和边界解析代码。

TypeScript 是 JavaScript 的超集：它保留 JavaScript 的运行语义，同时让编译器在开发时检查类型。运行时执行的仍是 JavaScript，类型会在编译时擦除。因此类型不能校验 HTTP 请求、数据库记录或用户输入。

在空目录中安装并编译：

~~~sh
npm init -y
npm install --save-dev typescript
npx tsc --init
~~~

新建 main.ts，再运行 npx tsc -p .。编译器会按 tsconfig 检查项目并生成 JavaScript 文件；若只想检查，可配置 noEmit。

## 通过类型检查不代表运行条件已经满足

- 类型正确不代表业务逻辑正确。
- 编译成功不代表部署时依赖、环境变量或数据库都正常。
- 不要把 TypeScript 当作运行时校验器。

## 动手验证

给一个函数参数标注 number，却传入字符串；观察编译错误。再删除类型标注，比较推断结果。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：调试时，先找实际数据第一次变错的位置](/notes/typescript-13-debugging) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：类型推断、unknown、any 与函数边界](/notes/typescript-15-basic-types)

