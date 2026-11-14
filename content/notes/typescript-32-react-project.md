---
title: "TypeScript 32：建立 React 与 TypeScript 项目"
date: "2026-11-12"
excerpt: "开发服务器能显示页面，部署时应该上传什么？从React、Vite与TSX的分工建立最小项目，再核对构建产物、公开配置与生产访问路径。"
tags: [ "TypeScript", "React 组件" ]
category: "typescript-08-react"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

运行npm run dev看到了页面，但部署机器上不应该照搬一个长期开发服务器。开发时工具提供热更新与源码转换，生产则通常交付已经构建好的静态资源。先分别跑通这两条路径，后面的问题才有明确起点。

Vite 提供本地开发服务器和生产打包。React 负责根据组件与状态描述界面；TypeScript 检查组件数据与事件类型。

~~~sh
npm create vite@latest web -- --template react-ts
cd web
npm install
npm run dev
~~~

页面由入口文件挂载到 HTML 节点。TSX 文件可同时写 TypeScript 与 JSX。生产运行 npm run build，生成静态资源；部署服务器不需要执行开发服务器。

React根据组件返回值与状态计算界面，Vite负责开发转换与生产资源组织，TypeScript负责静态关系。JSX描述元素，不是浏览器直接认识的新HTML文件；入口把根组件挂到页面节点，之后状态变化由React更新相关DOM。

模板与工具的Node要求随版本变化，创建前核对当前Vite文档。运行失败先看Node版本和安装日志，不反复换模板。生成后的package.json说明typecheck与build到底执行什么，保留锁文件让后续环境从相同依赖开始。

先把页面缩到静态任务列表，确认标题、状态与稳定key；不必一开始接路由、登录与数据库。开发页面正常后执行生产构建，再用预览服务实际打开产物，检查资源地址，而不仅是看到dist目录存在。

## 开发服务、浏览器和 Node 的边界

- Vite 开发服务器只适合开发，不应直接作为生产服务。
- 浏览器环境变量最终会进入客户端构建，不能放私钥。
- 浏览器 API 的类型由 DOM 库提供，不能在 Node 中直接使用。

Vite常用前缀公开环境变量，但名称过滤不等于秘密保护，凡进入浏览器bundle的值都可读取。API公开地址可以放在构建配置，数据库密码与会话密钥留在服务端。生产更换变量是否需要重新构建，也要按注入时机确定。

部署到子路径时检查资源base与路由前缀，直接访问深层页面也要成立。预览服务用于核验构建，正式站点则由静态托管或Web服务器承接，并为API保留真实路由，不把所有请求都改成HTML。

## 动手验证

建立示例项目的 web 应用，在首页显示静态任务列表并完成一次生产构建。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：格式、Lint、类型检查和构建分别能证明什么](/notes/typescript-31-quality-tooling) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：组件、Props 与组合：把输入和事件说清楚](/notes/typescript-33-components-props)

