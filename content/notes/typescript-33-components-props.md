---
title: "TypeScript 33：组件、Props 与组合：把输入和事件说清楚"
date: "2026-11-12"
excerpt: "任务卡片显示状态，却不直接修改父列表，它怎样通知操作？用明确Props与回调组织组件，区分数据所有者、展示和浏览器控件语义。"
tags: [ "TypeScript", "React 组件" ]
category: "typescript-08-react"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

同一任务卡片出现在列表和搜索结果里，如果它自己读取某个全局列表再修改，就很难知道到底改的是谁。让父级提供数据，子级只报告“用户要打开它”，组件就能在不同上下文复用，而不拥有多余状态。

组件是接收 Props 并返回界面的函数。组件名称以大写开头。children 表示嵌套内容；组件组合通常比一个超大组件更易维护。

~~~tsx
type TaskCardProps = {
  title: string;
  status: "todo" | "in_progress" | "done";
  onOpen: () => void;
};

export function TaskCard({ title, status, onOpen }: TaskCardProps) {
  return (
    <button type="button" onClick={onOpen}>
      {title}：{status}
    </button>
  );
}
~~~

Props 是只读输入。回调属性应描述组件通知父级发生了什么，而不是让子组件直接修改父级数据。

这段保存为TaskCard.tsx。onOpen是待调用的函数，传给onClick而不是在渲染时执行；父级可以在闭包里关联具体任务编号。组件不需要知道是打开详情、弹窗还是导航，这项决定留给使用者。

使用button让键盘和辅助技术获得原生交互语义。若扩展完成按钮，外层应改为合适容器，两个按钮各自独立，不能在已有button里面嵌另一个button。组件拆分不应破坏HTML实际允许的结构。

## 哪些状态值得留在子组件

卡片临时展开可以由当前层持有，业务完成状态则以父级或服务端为来源。父级传status后，子级不再复制一份初始status放进state，否则更新Props时可能显示旧值。能从输入直接计算的文案，也不必另加effect同步。

children适合传嵌套内容，明确Props适合业务字段和动作。组件不要只为少几行JSX就抽象：当它有独立语义、复用或状态边界时，拆分才能减少理解成本。只有一次使用的简单包装，留在原处也可以。

## 组件输入保持只读，缺省行为要明确

- 不要给每个组件都添加 React.FC；普通函数组件更直接。
- 可选 Props 应明确缺省行为。
- Props 类型不能阻止浏览器里的恶意输入，服务端仍需校验。

可选描述要定义空值表现，不把undefined直接显示成文字；状态未知则应在数据解析边界失败，而不是组件临时猜成todo。父级与子级输入合同清楚以后，测试就能直接传数据并触发回调，不必启动整个应用。

## 动手验证

实现 TaskCard 的空描述显示和完成按钮；用 Props 传入数据与事件回调。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：建立 React 与 TypeScript 项目](/notes/typescript-32-react-project) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：React 状态与列表更新](/notes/typescript-34-state-events)

