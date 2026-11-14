---
title: "TypeScript 15：类型推断、unknown、any 与函数边界"
date: "2026-11-12"
excerpt: "同样表示暂时不知道类型，unknown为什么不让直接调用方法，any却放行？从推断与函数边界说明检查器知道什么，以及void、never分别表达哪种返回行为。"
tags: [ "TypeScript", "TypeScript 类型基础" ]
category: "typescript-04-typescript-core"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

外部数据暂时不知道类型，有两种写法都能标出来：any与unknown。区别出现在下一步，any允许继续读取和调用，unknown要求先拿出证据。前者把检查关掉，后者把未确认状态保留下来。

常见类型有 string、number、boolean、null、undefined、bigint、symbol。变量可由初始值推断类型；函数边界、复杂对象和公共 API 通常值得显式标注。

~~~ts
const username = "Lin";
let retryCount = 0;
let selectedTask: string | null = null;

function double(value: number): number {
  return value * 2;
}
~~~

any 会关闭检查，应谨慎使用。unknown 表示暂时不知道类型，使用前需要验证。never 表示不可能到达的值；void 常用于不返回有意义结果的函数。

username由const与字符串字面量推断，retryCount可重新赋值，通常扩大为number。selectedTask一开始是null，但用途是之后还会保存编号，所以显式写联合类型。注解应该补足意图，不必给每个能清楚推断的局部值重复写一遍。

普通独立函数的参数不会根据所有调用点自动推断，strict下省略参数类型可能成为隐式any错误；作为已知类型回调时，则可从上下文得到参数类型。两种推断来源不同，不能把删除注解一律理解成编译器会替你猜完整。

## unknown怎样变成可用的值

接收unknown后，先用typeof确认number，再检查Number.isFinite等业务范围，才做平方或金额计算。typeof number也包含NaN和无穷，所以类型收窄并不自动完成业务校验。解析函数可以在失败时抛出清楚错误，成功返回已确认的数值。

any可以沿赋值与函数调用继续传播，让后续看似有类型的代码也失去证据。遇到第三方无声明接口，先把边界收到的值作为unknown并解析，而不是在业务中到处as any。确实需要适配的范围应尽量小且有验证。

void通常表示调用方不使用返回结果，并不总要求实现完全没有return；never表示函数不正常返回，例如一直抛错。一个返回Promise<void>的操作仍需要等待失败，不能因为没有有意义结果就把它遗弃。

开启严格空值检查后，null与undefined也要进入相应类型。这样“尚未选任务”不会与空编号混为一谈，调用方必须在使用前处理，而不是等到运行时访问属性才发现。

## 不要用 any 抹掉尚未理解的问题

- 不要给每个局部变量都写重复类型，保留清晰的推断即可。
- unknown 不可直接当作任意类型使用。
- 不要用 any 消掉错误；先理解值从哪里来。

## 动手验证

实现一个函数接收未知值，确认它是数字后返回平方，否则返回明确错误结果。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：TypeScript 的检查发生在什么时候](/notes/typescript-14-typescript-compiler) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：数组、元组和对象类型怎样表达约束](/notes/typescript-16-object-types)

