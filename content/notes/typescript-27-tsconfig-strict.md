---
title: "TypeScript 27：tsconfig 与 strict：每个检查选项在管什么"
date: "2026-11-12"
excerpt: "遇到配置问题，我会先确认哪些文件参与检查，再看目标运行时、模块模式和严格选项。strict 包含一组检查，但不会自动打开所有质量规则。"
tags: [ "TypeScript", "TypeScript 工程实践" ]
category: "typescript-07-typescript-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

遇到配置问题，我会先确认哪些文件参与检查，再看目标运行时、模块模式和严格选项。strict 包含一组检查，但不会自动打开所有质量规则。

tsconfig.json 定义编译输入、输出和检查规则。strict 打开一组严格检查；noEmit 可只检查、不输出文件；目标和库选项决定可用语法与内置 API 类型。

~~~json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}
~~~

不同运行时和构建工具需要不同 module 配置，不能把网上某个 tsconfig 无条件复制到所有项目。

## 配置要和实际工具链一起核对

- skipLibCheck 不是修复应用代码类型错误的办法。
- include 和 exclude 会影响哪些文件参与检查。
- 开启 strict 后，优先修正真实边界问题，不要批量添加类型断言。

## 动手验证

开启 strict 并启用 noUnusedLocals、noUnusedParameters，观察未标注参数、可能为空的值和未使用声明分别会产生什么结果。strict 本身不包含未使用检查。

noUncheckedIndexedAccess 会让数组或索引签名读取结果包含 undefined，适合暴露边界访问问题；若在现有项目中启用，应逐步处理新增的可空类型。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：声明文件：编译器从哪里认识一个 JavaScript 包](/notes/typescript-26-declarations) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：模块解析：编译通过之后为什么还会导入失败](/notes/typescript-28-module-resolution)

