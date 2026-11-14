---
title: "TypeScript 33：组件、Props 与组合：把输入和事件说清楚"
date: "2026-11-12"
excerpt: "拆组件时，我会先列出它需要哪些数据，以及要把什么操作通知给父级。这样 Props 和回调就有了明确含义，也比较容易看出哪些状态不应该由子组件直接改。"
tags: [ "TypeScript", "React 组件" ]
category: "typescript-08-react"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

拆组件时，我会先列出它需要哪些数据，以及要把什么操作通知给父级。这样 Props 和回调就有了明确含义，也比较容易看出哪些状态不应该由子组件直接改。

组件是接收 Props 并返回界面的函数。组件名称以大写开头。children 表示嵌套内容；组件组合通常比一个超大组件更易维护。

~~~tsx
type TaskCardProps = {
  title: string;
  status: "todo" | "in_progress" | "done";
  onOpen: () => void;
};

function TaskCard({ title, status, onOpen }: TaskCardProps) {
  return (
    <button type="button" onClick={onOpen}>
      {title}：{status}
    </button>
  );
}
~~~

Props 是只读输入。回调属性应描述组件通知父级发生了什么，而不是让子组件直接修改父级数据。

## 组件输入保持只读，缺省行为要明确

- 不要给每个组件都添加 React.FC；普通函数组件更直接。
- 可选 Props 应明确缺省行为。
- Props 类型不能阻止浏览器里的恶意输入，服务端仍需校验。

## 动手验证

实现 TaskCard 的空描述显示和完成按钮；用 Props 传入数据与事件回调。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：建立 React 与 TypeScript 项目](/notes/typescript-32-react-project) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：React 状态与列表更新](/notes/typescript-34-state-events)

