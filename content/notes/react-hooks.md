---
title: React Hooks 学习笔记
date: 2026-02-02
excerpt: 深入理解 React Hooks 的使用方法和最佳实践，包括 useState、useEffect、useCallback 等常用 Hook。
tags:
  - React
  - JavaScript
  - 前端
---

## 什么是 Hooks

Hooks 是 React 16.8 引入的新特性，它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## Hooks 知识图谱

下面是 React Hooks 的知识结构图：

```graph
{
  "nodes": [
    { "id": "hooks", "position": { "x": 250, "y": 0 }, "data": { "label": "React Hooks", "color": "red", "tags": ["核心概念"], "content": "React 16.8 引入的新特性" } },
    { "id": "useState", "position": { "x": 0, "y": 120 }, "data": { "label": "useState", "color": "blue", "tags": ["状态管理"], "content": "用于在函数组件中添加状态" } },
    { "id": "useEffect", "position": { "x": 200, "y": 120 }, "data": { "label": "useEffect", "color": "blue", "tags": ["副作用"], "content": "处理副作用，如数据获取、订阅" } },
    { "id": "useCallback", "position": { "x": 400, "y": 120 }, "data": { "label": "useCallback", "color": "green", "tags": ["性能优化"], "content": "缓存回调函数，避免不必要的渲染" } },
    { "id": "useMemo", "position": { "x": 500, "y": 120 }, "data": { "label": "useMemo", "color": "green", "tags": ["性能优化"], "content": "缓存计算结果" } },
    { "id": "useRef", "position": { "x": 100, "y": 240 }, "data": { "label": "useRef", "color": "purple", "tags": ["引用"], "content": "创建可变引用，不触发重渲染" } },
    { "id": "useContext", "position": { "x": 300, "y": 240 }, "data": { "label": "useContext", "color": "orange", "tags": ["上下文"], "content": "订阅 React Context" } },
    { "id": "customHooks", "position": { "x": 450, "y": 240 }, "data": { "label": "自定义 Hooks", "color": "yellow", "tags": ["进阶"], "content": "封装可复用的逻辑" } }
  ],
  "edges": [
    { "id": "e1", "source": "hooks", "target": "useState" },
    { "id": "e2", "source": "hooks", "target": "useEffect" },
    { "id": "e3", "source": "hooks", "target": "useCallback" },
    { "id": "e4", "source": "hooks", "target": "useMemo" },
    { "id": "e5", "source": "useState", "target": "useRef" },
    { "id": "e6", "source": "useEffect", "target": "useContext" },
    { "id": "e7", "source": "useCallback", "target": "customHooks" },
    { "id": "e8", "source": "useMemo", "target": "customHooks" }
  ]
}
```

## useState 的使用

useState 是最基础的 Hook，用于在函数组件中添加状态。

### 基本用法

使用 useState 声明一个状态变量非常简单，它返回一个数组，包含当前状态和更新函数。

### 注意事项

- 不要在循环、条件或嵌套函数中调用 Hook
- 只在 React 函数组件中调用 Hook

## useEffect 的使用

useEffect 用于处理副作用，比如数据获取、订阅或手动修改 DOM。

### 依赖数组

依赖数组是 useEffect 的第二个参数，它决定了 effect 何时重新执行。

## 总结

Hooks 让函数组件拥有了类组件的能力，同时代码更加简洁和易于理解。
