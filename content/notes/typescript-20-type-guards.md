---
title: "TypeScript 20：类型守卫与穷尽检查：把状态处理完整"
date: "2026-11-12"
excerpt: "类型守卫写成永远返回true，编译器会替你发现吗？从守卫的真实承诺到never穷尽检查，说明哪些结论由检查器推导，哪些仍由实现负责。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

写一个函数声称“返回true就一定是任务”，编译器通常会相信这项类型谓词。它不会自动证明函数检查足够完整。类型守卫位于证据进入静态系统的位置，判断写错，后续所有安全提示都可能建立在错误前提上。

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
      throw new Error("未处理的结果状态：" + String(unreachable));
    }
  }
}
~~~

类型守卫必须真实检查对象形状；不能只因变量名或调用位置看起来可信就返回 true。

describe使用kind区分成员，成功分支不需要读取value，失败分支才能取得message。default中result赋给never，表示前面应该排除了全部成员；新增一种pending以后，赋值不再成立，检查器就提醒这里需要处理。运行时若有人绕过类型传了未知状态，默认分支也会明确失败，不返回一个对象冒充字符串。

## 守卫要检查到承诺的每个字段

一个只承诺name为字符串的守卫可以这样写：

~~~ts
function isNamed(value: unknown): value is { name: string } {
  return typeof value === "object" && value !== null &&
    "name" in value && typeof value.name === "string";
}
~~~

先确认可读取的对象，再排除null，最后确认字段类型。它没有承诺名字非空、没有额外字段或来自可信用户，所以也没有检查那些条件；需要更强业务合同，就扩展解析规则与返回类型，不靠名称暗示。

谓词还需要正确表达失败分支。若定义 `isNumber` 却同时要求数值大于0，返回false时可能仍然是数字，调用方按非数字分支处理就错了。范围限制不一定适合用基础类型谓词描述，可以直接返回验证结果或解析成功值。

## 守卫的承诺必须有检查支撑

- 守卫中的错误判断会让后续类型检查产生虚假的安全感。
- 对象 API 响应应在边界解析，不要把断言散落在业务代码中。

穷尽检查处理的是已知静态联合，不能替代对外部kind的解析；守卫则负责让未知值进入已知范围。二者接起来，新增状态会影响所有应处理的位置，非法输入也不会绕过检查成为虚假成员。

## 动手验证

为任务状态定义判别联合，并实现完整的状态文案转换；新增状态时确认编译器提醒未处理分支。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：类型收窄：检查怎样影响后面的代码](/notes/typescript-19-narrowing) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：泛型：保留输入与输出之间的关系](/notes/typescript-21-generics)

