---
title: "TypeScript 51：npm workspaces：组织前端、API 和共享包"
date: "2026-11-12"
excerpt: "前后端开始共享 API 规则之后，我会把共享代码单独放成一个包。workspaces 统一安装和锁文件，但每个包依赖什么、先构建谁，仍然需要在项目里写明。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

前后端开始共享 API 规则之后，我会把共享代码单独放成一个包。workspaces 统一安装和锁文件，但每个包依赖什么、先构建谁，仍然需要在项目里写明。

npm workspaces 让多个 package 共用依赖安装和锁文件，同时保留各自脚本与依赖。示例项目结构：

~~~text
apps/
  web/
  api/
packages/
  shared/
package.json
~~~

根 package.json 声明 workspaces。web、api 和 shared 各有自己的 package.json。shared 导出 Schema；web 和 api 通过 workspace 依赖导入。先保证简单的运行与构建顺序，再考虑复杂打包工具。

## 共享包只放真正共享的合同

- workspace 不会自动解决所有模块解析和构建依赖。
- shared 只能放真正共享的 API 契约，不要变成杂物包。
- 锁文件放根目录并提交。

## 动手验证

创建三个 workspace package；让 web 和 api 都从 shared 导入一个字符串常量。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：认证与授权：保护任务属于谁这件事](/notes/typescript-50-auth-security) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：共享 Schema：让前后端使用同一份接口规则](/notes/typescript-52-shared-contracts)

