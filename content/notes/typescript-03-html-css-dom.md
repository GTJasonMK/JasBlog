---
title: "TypeScript 03：HTML、CSS 与 DOM：React 下面仍然是浏览器"
date: "2026-11-12"
excerpt: "输入框按回车为什么会提交，按钮点了为什么又刷新页面？从普通HTML表单解释语义、DOM与事件，再看React管理状态时依然依赖哪些浏览器规则。"
tags: [ "TypeScript", "Web 基础" ]
category: "typescript-01-web"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

输入框里按回车，页面提交了；一个本来只想展开设置的按钮，也触发提交。它们往往不是框架故障，而是浏览器按HTML默认规则工作。写组件之前先理解普通表单，会少掉很多用脚本修补的误会。

HTML 描述内容结构，CSS 描述呈现，JavaScript 处理交互。浏览器解析 HTML 后建立 DOM 树，脚本可注册事件并读取输入。React 把组件描述转换成页面更新，但仍运行在浏览器提供的 DOM 环境中。

~~~html
<form>
  <label for="title">任务标题</label>
  <input id="title" name="title" required />
  <button type="submit">添加</button>
</form>
~~~

语义标签让浏览器、辅助技术和用户都能理解控件用途。CSS 初期只需掌握选择器、盒模型、间距、Flexbox 和响应式宽度。

label的for与input的id关联，点击标签也能聚焦输入；name决定普通表单提交时字段叫什么，id主要用于定位与关联。placeholder只是输入提示，开始输入就可能消失，不能承担稳定名称的职责。

form把相关输入与提交行为组织起来。提交按钮或回车可以触发submit事件，脚本接管提交时监听form更完整，不能只绑定鼠标click。若使用fetch提交，处理函数通常调用preventDefault阻止默认导航，再显式处理加载、失败和成功。

required能阻止常规交互里的空值，但用户仍能绕过界面直接请求API；全空白字符串也可能通过某些基础检查。浏览器约束负责及时反馈，业务规范化与服务端校验仍然需要一致合同。

## 样式改变外观，不改变含义

CSS盒模型决定内容、内边距、边框和外边距怎样占空间。设置宽度时先统一box-sizing，容器用Flex或Grid组织对齐；窄屏要允许文字换行、控件缩放，避免固定大宽度溢出。

把div画得像按钮，不会自动获得键盘提交、焦点和禁用语义；优先使用button，再调整样式。视觉顺序与DOM顺序也要相容，否则屏幕上看着一排，键盘焦点却来回跳。

## 表单语义和输入标签要明确

- button 在表单中默认可能触发表单提交；明确设置 type。
- 标签应与输入框关联，不能只靠 placeholder 表示标签。
- DOM 操作会改变页面，但 React 项目应让 React 管理组件状态和渲染。

React组件最终仍更新DOM。若一边用React状态渲染输入，一边直接querySelector修改同一元素，下次渲染可能覆盖手工变化。把状态交给明确的管理者，确需访问DOM时再用ref处理聚焦等操作，避免两套状态互相争夺。

## 动手验证

给表单添加一个状态选择框和提交按钮；确保每个输入控件都有可见标签。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：浏览器、API 与数据库之间发生了什么](/notes/typescript-02-web-architecture) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：读懂一次 HTTP 请求和 JSON 响应](/notes/typescript-04-http-json-api)

