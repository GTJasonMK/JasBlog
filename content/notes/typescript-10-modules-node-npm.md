---
title: "TypeScript 10：模块、Node.js 与 npm：让文件和依赖各归其位"
date: "2026-11-12"
excerpt: "编辑器能跳转到模块，Node为什么说找不到文件？区分源码导入、运行时解析与npm依赖声明，再用两个真正分开的文件理解ESM。"
tags: [ "TypeScript", "JavaScript 异步与工具" ]
category: "typescript-03-js-engineering"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个文件拆成两个以后，函数没改，程序却启动失败。错误可能来自模块模式、扩展名或当前构建产物，和函数内容无关。编辑器能够定位源码，也不代表运行时按同一套规则找到它。

ES Modules 使用 export 暴露功能，使用 import 依赖其他模块。Node.js 提供文件、进程和网络等服务端能力；浏览器不提供相同的 API。npm 用 package.json 记录依赖和脚本，package-lock.json 锁定依赖树。

使用 Node 原生 ESM 时，在 package.json 中声明 type 为 module；Vite 等打包工具也能处理 ESM 导入。初学阶段保持同一项目使用一种模块模式。

下面的注释分别标出两个文件，不能整段放进同一个main.js；在package.json声明 `"type": "module"` 后运行 `node main.js`：

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

导入math模块会初始化模块级代码，再提供导出绑定；同一模块身份通常只初始化一次。把连接数据库或启动定时器放在模块最外层，会让“只是导入一个函数”也触发副作用，测试与资源关闭因此变难。需要控制生命周期的工作在入口显式启动。

Node原生ESM通常要求相对文件导入写明扩展名，打包工具可能允许省略。路径别名如果只在tsconfig配置，不一定被Node识别；源码检查、转译和运行时解析是不同步骤，后面的模块章节会继续核对。

## 安装了什么，怎样让别人重现

package.json表达直接依赖与脚本，lock文件记录解析后的依赖树和校验信息。正常修改依赖通过npm命令更新二者；CI使用npm ci验证声明与锁文件一致，并按锁定结果安装。不要删除锁文件来掩盖不理解的依赖冲突。

dependencies用于运行所需包，devDependencies用于开发工具，但最终打包和部署方式仍决定哪些文件要存在。生产服务运行编译后的代码，不能依赖本机全局安装的工具；构建所需工具也要在构建阶段明确可用。

## 类型、路径和运行时要对得上

- 相对导入路径通常需要正确的文件扩展名，规则取决于运行时和构建工具。
- 不要手工编辑 lock 文件。
- 不要把 .env 中的秘密提交到版本库。

## 动手验证

创建两个模块：一个导出任务筛选函数，另一个导入并调用它；再把运行命令写入 package.json。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：对象、原型与 class 的关系](/notes/typescript-09-object-model) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：Promise 与事件循环：等待不等于阻塞线程](/notes/typescript-11-promises-event-loop)

