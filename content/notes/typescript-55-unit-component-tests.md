---
title: "TypeScript 55：单元和组件测试：把用户能观察到的行为写下来"
date: "2026-11-12"
excerpt: "测试表单时，我会从用户能做的操作和能看到的结果出发：输入为空会怎样，提交几次，错误在哪里出现。组件内部换一种写法，只要行为不变，测试不该因此全改。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

测试表单时，我会从用户能做的操作和能看到的结果出发：输入为空会怎样，提交几次，错误在哪里出现。组件内部换一种写法，只要行为不变，测试不该因此全改。

Vitest 可运行 TypeScript 单元测试；React Testing Library 从用户操作角度查找和操作元素。测试行为而不是组件内部实现细节。

~~~tsx
render(<TaskForm onSubmit={onSubmit} />);
await user.type(screen.getByLabelText("任务标题"), "读书");
await user.click(screen.getByRole("button", { name: "添加任务" }));
expect(onSubmit).toHaveBeenCalledWith({ title: "读书" });
~~~

纯逻辑适合单元测试；表单、错误提示和可访问名称适合组件测试。测试名称应说明行为和条件。

## 测试失败需要暴露真实问题

- 不要只测试实现细节或快照。
- 避免让测试共用会互相污染的状态。
- 失败的测试应让真实错误显现，不要捕获后通过。

## 动手验证

测试空标题阻止提交、有效标题提交一次、提交中按钮禁用。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：注册、登录、刷新与退出的完整流程](/notes/typescript-54-auth-integration) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：API 与端到端测试：确认整条路径能走通](/notes/typescript-56-api-e2e-tests)

