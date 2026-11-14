---
title: "TypeScript 34：React 状态与列表更新"
date: "2026-11-12"
excerpt: "切换一条任务状态时，我会创建新数组，只替换对应的对象。这样变化来自哪里比较明确，配合稳定的 key，React 也能保留每一项的身份。"
tags: [ "TypeScript", "React 组件" ]
category: "typescript-08-react"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

切换一条任务状态时，我会创建新数组，只替换对应的对象。这样变化来自哪里比较明确，配合稳定的 key，React 也能保留每一项的身份。

useState 用于组件状态。状态更新应创建新值，React 根据新状态重新渲染。表单、列表选中项和加载状态都可以是组件状态。

~~~tsx
const [tasks, setTasks] = useState<Task[]>([]);

function addTask(task: Task) {
  setTasks((current) => [...current, task]);
}

return tasks.map((task) => (
  <TaskCard key={task.id} title={task.title} status={task.status} onOpen={() => {}} />
));
~~~

列表 key 应稳定标识元素，不用数组下标表示可插入、删除或排序的数据。

## 引用、闭包与派生状态都要留意

- 直接 push 原数组不会可靠地触发更新。
- 更新依赖旧状态时使用函数式更新，避免闭包拿到过期值。
- 状态不要重复保存可从其他状态计算出的值。

## 动手验证

实现任务完成切换；保持不可变更新，并确认只更新对应任务。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：组件、Props 与组合：把输入和事件说清楚](/notes/typescript-33-components-props) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：Hooks：同步外部系统与复用组件逻辑](/notes/typescript-35-hooks)

