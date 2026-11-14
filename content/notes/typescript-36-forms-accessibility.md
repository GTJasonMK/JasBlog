---
title: "TypeScript 36：把表单做完整：输入、错误、提交和键盘"
date: "2026-11-12"
excerpt: "一个表单能点提交，还不代表它已经好用。我会用键盘走一遍，检查标签能否说明字段、错误能否定位、失败后输入是否保留，以及提交中会不会再次发送。"
tags: [ "TypeScript", "React 组件" ]
category: "typescript-08-react"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个表单能点提交，还不代表它已经好用。我会用键盘走一遍，检查标签能否说明字段、错误能否定位、失败后输入是否保留，以及提交中会不会再次发送。

受控输入的 value 来自 React 状态，onChange 更新状态。提交时先阻止浏览器默认刷新，再校验并发送请求。错误信息应关联到输入框，成功和加载状态也应清楚可见。

~~~tsx
import { useState } from "react";
import type { FormEvent } from "react";

type TaskFormProps = {
  createTask: (input: { title: string }) => Promise<unknown>;
};

function TaskForm({ createTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setError("请输入任务标题");
      return;
    }

    setPending(true);
    setError(null);
    try {
      await createTask({ title: value });
      setTitle("");
    } catch {
      setError("保存失败，请重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">任务标题</label>
      <input
        id="title"
        value={title}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "title-error" : undefined}
        onChange={(event) => setTitle(event.target.value)}
      />
      {error && <p id="title-error" role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "正在添加…" : "添加任务"}
      </button>
    </form>
  );
}
~~~

示例假设 createTask 是注入的异步函数。用真实 label、button 和输入控件；保留可见焦点样式。提交中禁用重复提交，并通过 role=alert 播报动态错误。

## 反馈需要文字和语义，不只靠颜色

- 仅有颜色或 placeholder 不能充分说明错误或字段含义。
- 非提交按钮需使用 type=button。
- 前端提示是用户体验；服务端仍需再次验证数据。

## 动手验证

给表单添加必填提示和提交中状态；用键盘完成完整提交流程。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：Hooks：同步外部系统与复用组件逻辑](/notes/typescript-35-hooks) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：路由与页面：URL 怎样对应到组件](/notes/typescript-37-routing)

