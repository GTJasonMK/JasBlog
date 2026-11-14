---
title: "TypeScript 26：声明文件：编译器从哪里认识一个 JavaScript 包"
date: "2026-11-12"
excerpt: "调用第三方包时能看到参数提示，是因为编译器找到了类型声明。我会先定位声明入口，再对照实际导出，确认它描述的是当前安装版本真正提供的能力。"
tags: [ "TypeScript", "进阶类型" ]
category: "typescript-06-typescript-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

调用第三方包时能看到参数提示，是因为编译器找到了类型声明。我会先定位声明入口，再对照实际导出，确认它描述的是当前安装版本真正提供的能力。

TypeScript 包可携带声明文件，也可通过 DefinitelyTyped 的类型包补充。d.ts 描述已有 JavaScript API，不包含实现。环境声明用于描述全局变量或构建工具注入的值；模块扩展和声明合并用于补充已有模块或接口类型。使用 import type 只导入类型，避免不必要的运行时导入。

使用第三方包时先查其官方类型是否已内置，避免安装重复或过时的类型包。若自己维护 JavaScript API，可为公开入口提供准确声明。

## 声明存在不等于运行时能力存在

- 声明文件写错可能让编译器相信不存在的能力。
- 不要用宽泛的全局声明掩盖未知类型。
- 声明只影响检查；运行时依赖仍必须实际存在。
- 模块扩展只影响编译器理解的类型，不会真的给运行时对象添加属性。

## 动手验证

查找一个已安装 npm 包的类型定义位置，并确认一个导出函数的参数和返回类型。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：TypeScript 类：接口、抽象类与私有字段](/notes/typescript-25-typescript-classes) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：tsconfig 与 strict：每个检查选项在管什么](/notes/typescript-27-tsconfig-strict)

