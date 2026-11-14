---
title: "TypeScript 19：类型收窄：检查怎样影响后面的代码"
date: "2026-11-12"
excerpt: "number分支返回以后，后面的值为什么只剩string？沿控制流看类型如何收窄，再区分真实检查、属性存在与没有验证作用的as断言。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个值可能是字符串或数字，直接调用toUpperCase会报错，因为数字没有这个方法。检查不是为了满足编译器的形式要求，而是程序真的需要根据不同值选择不同操作。编译器沿分支把已排除的可能移走。

类型收窄指编译器根据控制流缩小联合类型。常用检查包括 typeof、instanceof、in 和判空。对外部输入，应先检查形状再读取字段。

~~~ts
function formatValue(value: string | number): string {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toUpperCase();
}
~~~

控制流分析会追踪分支、早返回和赋值。早返回常让代码更容易读，也能缩小后续代码中的类型。

传3得到3.00，传ab得到AB。数字分支已经return，下面就只剩string。这里是展示值格式化，保留两位小数会舍入，不应用于编号解析或精确结算；名称也改为formatValue，避免把格式化误当合法ID校验。

若类型再加null，先处理 `value === null` 再继续；只写 `if (value)` 会同时排除0与空字符串，可能丢掉合法输入。收窄方式要对应业务要排除的状态，不能把真值判断当成所有判空需求。

## 断言和真实检查的作用不同

- typeof value === "object" 还可能得到 null 或数组，需要进一步判断。
- 类型断言不会验证值；它只是要求编译器相信开发者。
- in 只能证明属性存在，不能保证属性值业务上有效。

typeof得到object时还要排除null，数组也属于object。in会沿属性关系判断是否存在，字段可能是undefined或错误类型；只关心自有字段时再用相应检查。instanceof依赖构造与原型关系，JSON对象不会因为形状像Date就成为Date实例。

as只是静态承诺，`value as Task` 不读取任何字段，也不执行转换。若没有足够检查，后面类型看起来安全，运行仍会失败。外部数据集中解析，内部流程再利用收窄，能同时减少重复检查和没有依据的断言。

重新赋值可能改变变量当前可知类型，回调执行时共享对象也可能已被修改。必要时先保存本地已确认值，再传给后续逻辑，避免把某一时刻的检查无限期套到会变化的状态上。

## 动手验证

实现一个函数，接收 string、number 或 null；分别格式化字符串和数字，并为 null 返回空文本。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：type、interface 与联合类型怎么配合](/notes/typescript-18-alias-interface-unions) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：类型守卫与穷尽检查：把状态处理完整](/notes/typescript-20-type-guards)

