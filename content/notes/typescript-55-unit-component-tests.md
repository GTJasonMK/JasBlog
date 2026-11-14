---
title: "TypeScript 55：单元和组件测试：把用户能观察到的行为写下来"
date: "2026-11-12"
excerpt: "组件换了state写法，用户行为没变，测试为什么全坏了？通过真实标签、输入与提交验证表单合同，把规范化结果和失败恢复写进断言。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

测试直接检查某个useState调用了几次，重构组件就可能全坏，用户却看不出任何区别。更稳定的检查从操作和结果出发：输入标题、提交、看到成功或错误，再检查发出的业务值。

Vitest 可运行 TypeScript 单元测试；React Testing Library 从用户操作角度查找和操作元素。测试行为而不是组件内部实现细节。

~~~tsx
// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "./TaskForm";

afterEach(cleanup);

test("提交规范化标题与初始状态，成功后清空输入", async () => {
  const user = userEvent.setup();
  const createTask = vi.fn(async () => undefined);
  render(<TaskForm createTask={createTask} />);
  const input = screen.getByLabelText("任务标题");
  await user.type(input, "  读书  ");
  await user.click(screen.getByRole("button", { name: "添加任务" }));
  expect(createTask).toHaveBeenCalledExactlyOnceWith({ title: "读书", status: "todo" });
  await waitFor(() => expect((input as HTMLInputElement).value).toBe(""));
});
~~~

把36章组件保存为TaskForm.tsx，测试放在同目录.test.tsx文件。在已有React/Vite项目安装Vitest、jsdom与两个Testing Library包，并沿用项目的自动JSX配置。示例使用真实createTask属性名，避免测试调用一个组件并不存在的onSubmit接口。

纯逻辑适合单元测试；表单、错误提示和可访问名称适合组件测试。测试名称应说明行为和条件。

按标签与角色寻找控件，测试同时检查了可访问名称。若只靠内部class或组件树位置，改布局就会失败，却可能漏过标签没有关联输入的问题。标题前后空白在提交前被去除，状态固定todo，断言由公开合同得出，而非复制组件内部代码。

异步断言等待明确结果，不固定sleep一秒猜完成时刻。pending场景让createTask的Promise保持未完成，检查按钮与输入禁用、重复submit只调用一次；随后手动完成或拒绝，确认状态恢复。

## 测试失败需要暴露真实问题

- 不要只测试实现细节或快照。
- 避免让测试共用会互相污染的状态。
- 失败的测试应让真实错误显现，不要捕获后通过。

空白与超长标题应不调用依赖，网络拒绝后保留草稿并显示提交错误，成功后才清空。jsdom适合快速DOM行为测试，布局、焦点与真实浏览器兼容仍在Playwright中检查。两层各承担需要的证据，不把一个巨大的端到端测试代替所有边界。

## 动手验证

测试空标题阻止提交、有效标题提交一次、提交中按钮禁用。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：注册、登录、刷新与退出的完整流程](/notes/typescript-54-auth-integration) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：API 与端到端测试：确认整条路径能走通](/notes/typescript-56-api-e2e-tests)

