---
title: "TypeScript 37：路由与页面：URL 怎样对应到组件"
date: "2026-11-12"
excerpt: "我会让 URL 表达当前正在看的资源，再用嵌套布局组织页面。点链接能打开和直接刷新能打开，是两条需要分别验证的访问路径。"
tags: [ "TypeScript", "前端应用" ]
category: "typescript-09-frontend-app"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会让 URL 表达当前正在看的资源，再用嵌套布局组织页面。点链接能打开和直接刷新能打开，是两条需要分别验证的访问路径。

React Router 根据 URL 选择页面组件。路由参数用于单条资源页面；嵌套路由可共享布局。单页应用导航通常不刷新整个文档，但服务器部署要把非 API 路径回退到应用入口。

安装并导入 React Router 后，用 BrowserRouter 提供路由上下文，再用 Routes 和 Route 定义页面：

~~~tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskListPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
~~~

用 Link 导航，避免普通链接造成不必要的整页加载。路由参数从 URL 来，读取后还应确认格式有效。BrowserRouter 需要位于应用入口，路由组件必须在其后代中。

## 前端导航不能替代服务端路由与授权

- 页面路由不是服务端 API 路由。
- 不能把授权只放在前端路由守卫里。
- 刷新深层链接需要部署服务器正确回退。

## 动手验证

添加任务列表、任务详情和未找到页面；在详情页从 URL 读取任务 id。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：把表单做完整：输入、错误、提交和键盘](/notes/typescript-36-forms-accessibility) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：请求状态：空列表和加载失败不能混在一起](/notes/typescript-38-api-requests)

