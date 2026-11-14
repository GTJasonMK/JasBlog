---
title: "TypeScript 21：泛型：保留输入与输出之间的关系"
date: "2026-11-12"
excerpt: "取出数组第一项，为什么不直接返回unknown或any？泛型要保存输入与输出的关系，再用带id的查找说明约束能保证什么、不能构造什么。"
tags: [ "TypeScript", "类型收窄与泛型" ]
category: "typescript-05-typescript-modeling"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

从任务数组取第一项，调用方还想读取title；从数字数组取第一项，又应该得到number。若返回unknown，调用方每次重新检查；若返回any，则丢掉误用保护。泛型保留的是“返回值来自传入元素类型”这条关系。

泛型把类型作为参数传入，让函数或结构复用，同时保留调用方的具体类型。若输入和返回值相关，泛型比 any 更安全。

~~~ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const task = first([{ id: "t1", title: "读书" }]);
~~~

可以用 extends 约束泛型必须具备的字段；默认类型参数适合拥有合理常见类型的公共结构。不要为了展示复杂语法而给简单函数加泛型。

这里T由传入数组推断，task保留id与title，但还可能是undefined，因为数组可能为空。泛型没有证明长度大于0，所以不能直接读取task.title。若业务保证非空，可以使用相应元组合同，而不是在所有调用处加非空断言。

## 约束是最低能力，不是完整类型

按编号查找时需要读取id，可以只约束这一项：

~~~ts
function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
~~~

传入带title的任务，结果仍保留title；传入带email的用户，则保留email。函数只读数组，不承诺找到结果，因此返回T或undefined。约束不需要列出调用方所有字段，也不该把结果扩大成只有id的对象。

`T extends { id: string }` 不允许函数随意返回 `{ id: "new" }` 充当T，因为调用方的T可能还要求title。约束让函数知道可使用的最低能力，不让它制造任意更具体对象。需要新建T时，应让调用方提供构造方式，或直接返回明确的基础类型。

## 泛型约束只说明最低要求

- 泛型类型参数不自动代表任意对象都有某属性。
- T extends Base 表示 T 至少满足 Base，不代表 T 就是 Base。
- 如果类型参数只出现一次且没有建立类型关系，泛型可能没有必要。

泛型在运行时通常没有对应对象，不能写typeof T来验证请求；需要运行时校验仍传解析器或使用已有Schema。只有类型之间确实存在要保留的关系时再引入参数，比给每个函数都加一个T更容易维护。

## 动手验证

实现一个函数，接收任意对象数组和 id，返回 id 相同的对象或 undefined；约束对象必须有 string 类型的 id。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：类型守卫与穷尽检查：把状态处理完整](/notes/typescript-20-type-guards) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：typeof、keyof 与索引访问：从现有声明推导类型](/notes/typescript-22-type-queries)

