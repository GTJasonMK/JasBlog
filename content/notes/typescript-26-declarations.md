---
title: "TypeScript 26：声明文件：编译器从哪里认识一个 JavaScript 包"
date: "2026-11-12"
excerpt: "补一行declare就消除了报错，运行却说函数不存在，声明究竟做了什么？从包入口和d.ts说明编译器的知识来源，再核对它与真实JavaScript版本是否一致。"
tags: [ "TypeScript", "进阶类型" ]
category: "typescript-06-typescript-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

缺少某个全局变量的类型，补一行declare，编辑器就不报错了；运行时却仍然ReferenceError。声明告诉检查器“它应该存在”，不会创建变量，也不会加载提供它的脚本。写声明相当于承诺，必须有实际实现支撑。

TypeScript 包可携带声明文件，也可通过 DefinitelyTyped 的类型包补充。d.ts 描述已有 JavaScript API，不包含实现。环境声明用于描述全局变量或构建工具注入的值；模块扩展和声明合并用于补充已有模块或接口类型。使用 import type 只导入类型，避免不必要的运行时导入。

使用第三方包时先查其官方类型是否已内置，避免安装重复或过时的类型包。若自己维护 JavaScript API，可为公开入口提供准确声明。

先看包的package.json，核对exports与types等入口，再通过编辑器跳转到实际d.ts。某些包按导入方式选择不同入口，ESM与CommonJS的声明也可能不同；只找到一个同名文件，不一定就是当前调用采用的合同。

内置声明跟包版本一起发布，独立的@types包则要检查适配版本。类型描述新版函数、运行却安装旧版实现，就可能编译通过仍找不到方法。skipLibCheck也不会修复这份版本不一致，只是跳过部分声明检查。

## 类型导入不等于加载实现

`import type` 在运行产物中不保留对应类型导入，适合只使用接口或别名的地方。若依赖模块初始化副作用，就需要明确的运行时导入，不能指望纯类型导入执行它。类型层依赖与运行时依赖要分别核对。

## 声明存在不等于运行时能力存在

- 声明文件写错可能让编译器相信不存在的能力。
- 不要用宽泛的全局声明掩盖未知类型。
- 声明只影响检查；运行时依赖仍必须实际存在。
- 模块扩展只影响编译器理解的类型，不会真的给运行时对象添加属性。

例如给Express请求声明currentUser，只让后续代码认识字段；认证中间件仍必须验证会话并在正确路径赋值。还要表达未认证时可能不存在，而不是通过全局必填声明假定每个请求都已经登录。

自己维护声明时，用小调用验证参数、返回值与导出名称，非法调用应失败，合法调用还要实际运行。把整个包声明为any能快速消除提示，却同时失去检查价值；只为有依据的公开API补准确合同。

## 动手验证

查找一个已安装 npm 包的类型定义位置，并确认一个导出函数的参数和返回类型。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：TypeScript 类：接口、抽象类与私有字段](/notes/typescript-25-typescript-classes) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：tsconfig 与 strict：每个检查选项在管什么](/notes/typescript-27-tsconfig-strict)

