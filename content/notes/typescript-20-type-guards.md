---
title: "TypeScript 20：类型守卫与穷尽检查：把状态处理完整"
date: "2026-11-12"
excerpt: "写类型守卫时，我会反过来检查每条判断是否足以支持那个返回类型。再用判别联合和 never 检查状态分支，避免新增状态之后调用方仍然悄悄漏处理。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

写类型守卫时，我会反过来检查每条判断是否足以支持那个返回类型。再用判别联合和 never 检查状态分支，避免新增状态之后调用方仍然悄悄漏处理。

类型谓词函数使用 value is SomeType 声明检查结果。判别联合用共同字段区分不同情况。将分支赋给 never，可在新增状态时触发编译错误。

~~~ts
type Result<T> =
  | { kind: "success"; value: T }
  | { kind: "failure"; message: string };

function describe<T>(result: Result<T>): string {
  switch (result.kind) {
    case "success":
      return "完成";
    case "failure":
      return result.message;
    default: {
      const unreachable: never = result;
      return unreachable;
    }
  }
}
~~~

类型守卫必须真实检查对象形状；不能只因变量名或调用位置看起来可信就返回 true。

## 守卫的承诺必须有检查支撑

- 守卫中的错误判断会让后续类型检查产生虚假的安全感。
- 对象 API 响应应在边界解析，不要把断言散落在业务代码中。

## 动手验证

为任务状态定义判别联合，并实现完整的状态文案转换；新增状态时确认编译器提醒未处理分支。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：类型收窄：检查怎样影响后面的代码](/notes/typescript-19-narrowing) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：泛型：保留输入与输出之间的关系](/notes/typescript-21-generics)

