---
title: "TypeScript 37：路由与页面：URL 怎样对应到组件"
date: "2026-11-12"
excerpt: "站内点击详情正常，复制地址刷新却404，是路由组件没写好吗？区分浏览器导航与服务器首次请求，再让URL、资源解析和部署路径保持一致。"
tags: [ "TypeScript", "前端应用" ]
category: "typescript-09-frontend-app"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

从列表点击任务详情正常，复制详情地址另开窗口却404。站内导航由已经运行的客户端路由处理，首次访问则先到服务器；服务器若不知道这个前端路径，就根本没有交付应用入口。两条访问路径要分别验证。

React Router根据URL选择页面组件，参数定位单条资源，嵌套路由共享布局。单页应用部署时，把明确属于前端页面的路径交给应用入口；API与缺失静态资源仍保留真实结果，不能所有404都改成HTML。

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

示例中的三个Page组件需由应用提供，并安装与版本匹配的react-router-dom。BrowserRouter在入口只提供一次，不在每个页面重复包一层。Link更新历史与当前路由，返回按钮也应回到合理页面，而非依赖一个永远丢失的本地选中编号。

taskId是外部文本，不因路径声明就成为合法数据库编号。解析格式以后请求API，格式无效与资源不存在分别处理；只改URL参数时，组件可能继续复用，加载逻辑也应响应参数变化并清理旧请求。

## 哪些状态放进URL

正在看的资源、需要分享的筛选和页码适合URL；尚未提交的敏感表单与短暂弹层状态未必适合。查询参数参与缓存键时，要统一默认值与规范格式，避免看似相同列表实际对应多份状态。

嵌套布局承载共同导航，子路由呈现当前内容，避免每个页面再复制一份相同壳。未找到页面要可返回有效入口，受保护路由则先等会话确认，不把“尚未检查”误当“未登录”。

## 前端导航不能替代服务端路由与授权

- 页面路由不是服务端 API 路由。
- 不能把授权只放在前端路由守卫里。
- 刷新深层链接需要部署服务器正确回退。

部署到子目录时还要核对basename与资源base。验收包括站内点击、直接打开、刷新、前进后退、无效编号与API404；这些检查分别覆盖客户端和服务器，不能只在开发服务器点通一次就结束。

## 动手验证

添加任务列表、任务详情和未找到页面；在详情页从 URL 读取任务 id。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：把表单做完整：输入、错误、提交和键盘](/notes/typescript-36-forms-accessibility) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：请求状态：空列表和加载失败不能混在一起](/notes/typescript-38-api-requests)

