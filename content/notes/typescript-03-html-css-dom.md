---
title: "TypeScript 03：HTML、CSS 与 DOM：React 下面仍然是浏览器"
date: "2026-11-12"
excerpt: "写 React 之前，我想先确认一个普通表单是怎么工作的。HTML 给出结构，CSS 决定呈现，事件把输入交给逻辑处理；组件只是把这些工作组织起来。"
tags: [ "TypeScript", "Web 基础" ]
category: "typescript-01-web"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

写 React 之前，我想先确认一个普通表单是怎么工作的。HTML 给出结构，CSS 决定呈现，事件把输入交给逻辑处理；组件只是把这些工作组织起来。

HTML 描述内容结构，CSS 描述呈现，JavaScript 处理交互。浏览器解析 HTML 后建立 DOM 树，脚本可注册事件并读取输入。React 把组件描述转换成页面更新，但仍运行在浏览器提供的 DOM 环境中。

~~~html
<form>
  <label for="title">任务标题</label>
  <input id="title" name="title" required />
  <button type="submit">添加</button>
</form>
~~~

语义标签让浏览器、辅助技术和用户都能理解控件用途。CSS 初期只需掌握选择器、盒模型、间距、Flexbox 和响应式宽度。

## 表单语义和输入标签要明确

- button 在表单中默认可能触发表单提交；明确设置 type。
- 标签应与输入框关联，不能只靠 placeholder 表示标签。
- DOM 操作会改变页面，但 React 项目应让 React 管理组件状态和渲染。

## 动手验证

给表单添加一个状态选择框和提交按钮；确保每个输入控件都有可见标签。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：浏览器、API 与数据库之间发生了什么](/notes/typescript-02-web-architecture) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：读懂一次 HTTP 请求和 JSON 响应](/notes/typescript-04-http-json-api)

