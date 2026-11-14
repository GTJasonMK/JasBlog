---
title: "TypeScript 35：Hooks：同步外部系统与复用组件逻辑"
date: "2026-11-12"
excerpt: "我会先问一段逻辑是否真的需要和外部系统同步。纯粹能从已有数据算出的结果，直接计算就好；请求、订阅和定时器才需要进一步考虑 effect 的依赖与清理。"
tags: [ "TypeScript", "React 组件" ]
category: "typescript-08-react"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我会先问一段逻辑是否真的需要和外部系统同步。纯粹能从已有数据算出的结果，直接计算就好；请求、订阅和定时器才需要进一步考虑 effect 的依赖与清理。

依赖数组要包含 effect 读取的响应式值，清理函数则负责取消订阅或停止过期工作。

~~~tsx
function useTasks() {
  const [state, setState] = useState<LoadState<Task[]>>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        const tasks = await loadTasks(controller.signal);
        if (!controller.signal.aborted) {
          setState({ kind: "ready", data: tasks });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "加载失败",
        });
      }
    }

    void run();
    return () => controller.abort();
  }, [loadTasks]);

  return state;
}
~~~

此示例是自定义 Hook，依赖 React 的 useEffect 与 useState；LoadState 来自[第 38 章](/notes/typescript-38-api-requests)，loadTasks 是模块级函数。若 loadTasks 是传入的回调，应确保其引用稳定。useRef 保存不触发渲染的值或 DOM 引用；useContext 读取共享上下文；useReducer 适合状态转换较集中时。

React StrictMode 在开发环境可能重复执行 effect 的设置与清理，用于暴露不安全副作用；请求应支持取消或保持幂等。Error Boundary 可隔离渲染期间的子树错误；它不能捕获普通事件处理器或异步请求错误。

## effect 的依赖和清理必须成对考虑

- Hook 必须在组件或自定义 Hook 顶层调用，不能放在条件分支中。
- 避免通过删除依赖项掩盖闭包过期问题。
- 能在渲染时计算的值通常不需要放进 effect 再同步。
- 不要把异步 effect 回调本身声明为 async；effect 需要同步返回清理函数。

## 动手验证

抽取 useTasks Hook，管理任务列表的加载、错误和刷新；说明其返回值如何帮助页面保持简单。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：React 状态与列表更新](/notes/typescript-34-state-events) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：把表单做完整：输入、错误、提交和键盘](/notes/typescript-36-forms-accessibility)

