---
title: "TypeScript 01：从 Python 转向 TypeScript，先分清运行环境"
date: "2026-11-12"
excerpt: "从 Python 转过来，我会先把 JavaScript、TypeScript、Node.js 和 npm 的职责分开。先知道代码由谁检查、由谁执行，再搭前后端项目，报错时才容易找对位置。"
tags: [ "TypeScript", "Web 基础" ]
category: "typescript-01-web"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

从 Python 转过来，我会先把 JavaScript、TypeScript、Node.js 和 npm 的职责分开。先知道代码由谁检查、由谁执行，再搭前后端项目，报错时才容易找对位置。

学习顺序是：Web 基础 → JavaScript → TypeScript → React → Node/Express → PostgreSQL/Prisma → 测试与部署。Python 基础能帮助理解变量、函数和数据结构，但 JavaScript 的运行时、异步方式和对象模型需要单独学习。

安装 Node.js LTS 后，终端应能识别：

~~~sh
node --version
npm --version
~~~

新建 hello.js：

~~~js
console.log("Hello, TypeScript!");
console.log(process.version);
~~~

运行 node hello.js。代码保存在文件中，终端命令负责启动 Node.js 执行它。

## 语言、运行时和工具不是同一层

- Node.js 是 JavaScript 运行时，不是另一种编程语言。
- npm 管理依赖和脚本；它不是 TypeScript 编译器。
- 先读错误的文件名和行号，再判断是命令、环境还是代码问题。

## 动手验证

创建一个文件，输出自己的名字以及 Node.js 版本。确认换一个目录后，运行相对路径时会发生什么。

## 运行后检查

能用自己的话说明 Node.js、npm、JavaScript 和 TypeScript 的区别。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：浏览器、API 与数据库之间发生了什么](/notes/typescript-02-web-architecture)

