---
title: "TypeScript 10：模块、Node.js 与 npm：让文件和依赖各归其位"
date: "2026-11-12"
excerpt: "把代码拆成文件以后，导入路径就成了程序能否运行的一部分。我会先选定模块模式，再用 package.json 管理依赖和脚本，让开发与生产使用一致的规则。"
tags: [ "TypeScript", "JavaScript 异步与工具" ]
category: "typescript-03-js-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

把代码拆成文件以后，导入路径就成了程序能否运行的一部分。我会先选定模块模式，再用 package.json 管理依赖和脚本，让开发与生产使用一致的规则。

ES Modules 使用 export 暴露功能，使用 import 依赖其他模块。Node.js 提供文件、进程和网络等服务端能力；浏览器不提供相同的 API。npm 用 package.json 记录依赖和脚本，package-lock.json 锁定依赖树。

使用 Node 原生 ESM 时，在 package.json 中声明 type 为 module；Vite 等打包工具也能处理 ESM 导入。初学阶段保持同一项目使用一种模块模式。

~~~js
// math.js
export function add(a, b) {
  return a + b;
}

// main.js
import { add } from "./math.js";
console.log(add(2, 3));
~~~

package.json 中的脚本可通过 npm run name 执行。安装依赖前先确认包名和维护状态，避免不必要的依赖。

## 类型、路径和运行时要对得上

- 相对导入路径通常需要正确的文件扩展名，规则取决于运行时和构建工具。
- 不要手工编辑 lock 文件。
- 不要把 .env 中的秘密提交到版本库。

## 动手验证

创建两个模块：一个导出任务筛选函数，另一个导入并调用它；再把运行命令写入 package.json。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：对象、原型与 class 的关系](/notes/typescript-09-object-model) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：Promise 与事件循环：等待不等于阻塞线程](/notes/typescript-11-promises-event-loop)

