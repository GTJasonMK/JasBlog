---
title: "TypeScript 28：模块解析：编译通过之后为什么还会导入失败"
date: "2026-11-12"
excerpt: "导入语句会先经过类型解析，运行时或打包工具还要再次找到真实模块。我会把这两条路径分别核对，尤其检查文件扩展名、导出入口和路径别名。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

导入语句会先经过类型解析，运行时或打包工具还要再次找到真实模块。我会把这两条路径分别核对，尤其检查文件扩展名、导出入口和路径别名。

模块解析受 package.json、文件扩展名、运行时和打包工具影响。浏览器代码通常由 Vite 打包；Node 服务可以使用原生 ESM。package.json 的 type 字段会影响 Node 对 JavaScript 文件的解释。

选择工具链的默认模块模式，并让开发、测试和生产构建保持一致。不要为了消除解析报错而随意增加路径别名。

## 所有工具都需要理解同一套路径

- 编译器能找到类型，不代表运行时一定能找到对应模块。
- 路径别名要同时配置给编译器、测试工具和打包工具。
- ESM 与 CommonJS 混用时要检查依赖的导出方式。

## 动手验证

建立一个小模块，在浏览器项目和 Node 项目各导入一次，记录配置和路径解析差异。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：tsconfig 与 strict：每个检查选项在管什么](/notes/typescript-27-tsconfig-strict) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：用 Zod 守住运行时输入边界](/notes/typescript-29-runtime-validation)

