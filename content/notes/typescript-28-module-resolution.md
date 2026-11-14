---
title: "TypeScript 28：模块解析：编译通过之后为什么还会导入失败"
date: "2026-11-12"
excerpt: "paths配置后编辑器不报错，Node仍找不到@/模块，哪一步没有发生？分别追踪类型解析、产物导入与包导出条件，找到开发和生产的规则差异。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

在tsconfig里写paths，编辑器能跳转，编译后Node却说找不到@/utils。paths帮助检查器定位源码，通常不会把输出导入自动重写成Node认识的地址。两套解析需要分别成立，不能只验证其中一套。

模块解析受 package.json、文件扩展名、运行时和打包工具影响。浏览器代码通常由 Vite 打包；Node 服务可以使用原生 ESM。package.json 的 type 字段会影响 Node 对 JavaScript 文件的解释。

选择工具链的默认模块模式，并让开发、测试和生产构建保持一致。不要为了消除解析报错而随意增加路径别名。

Node原生ESM根据文件扩展名与最近package.json的type等规则解释文件，相对导入通常写运行产物的.js扩展名；TypeScript在NodeNext下可以把这项导入对应到源码.ts。打包器可能允许省略扩展名，但那是打包过程提供的能力。

包的exports定义公开入口，某个node_modules内部文件真实存在，也未必允许直接深导入。条件导出还可能为浏览器、import与require选择不同文件，类型入口也要与对应实现匹配。混用模式出错时，先查实际选中了哪个入口。

## 沿产物查一次，而不只读源码

先确认tsc检查采用的配置，再看生成JavaScript保留了什么导入，最后用生产启动命令执行。若开发使用tsx或Vite处理别名，生产直接node运行，就必须确认别名已经打包、重写或有明确运行时支持。

## 所有工具都需要理解同一套路径

- 编译器能找到类型，不代表运行时一定能找到对应模块。
- 路径别名要同时配置给编译器、测试工具和打包工具。
- ESM 与 CommonJS 混用时要检查依赖的导出方式。

测试工具也可能有自己的解析配置，单测通过不能证明生产入口可加载。建立一个最小模块并从构建目录启动，往往比同时更改module、moduleResolution与多个别名更快定位根因。

如果只是邻近文件，清楚的相对路径通常足够；公共包通过稳定exports暴露能力，不跨进兄弟应用的源码目录。模块边界清楚以后，移动内部实现才不必让全部调用方跟着改路径。

## 动手验证

建立一个小模块，在浏览器项目和 Node 项目各导入一次，记录配置和路径解析差异。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：tsconfig 与 strict：每个检查选项在管什么](/notes/typescript-27-tsconfig-strict) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：用 Zod 守住运行时输入边界](/notes/typescript-29-runtime-validation)

