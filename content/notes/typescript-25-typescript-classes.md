---
title: "TypeScript 25：TypeScript 类：接口、抽象类与私有字段"
date: "2026-11-12"
excerpt: "给类加类型之后，我会继续区分编译期限制和运行时行为。implements 检查形状，普通 private 限制静态访问，它们都不会自动替对象生成实现或建立授权边界。"
tags: [ "TypeScript", "进阶类型" ]
category: "typescript-06-typescript-advanced"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

给类加类型之后，我会继续区分编译期限制和运行时行为。implements 检查形状，普通 private 限制静态访问，它们都不会自动替对象生成实现或建立授权边界。

TypeScript 类可声明字段类型、构造参数和方法类型；implements 检查类是否满足接口。abstract 类不能直接实例化，可包含共享实现。public、private、protected 主要约束静态访问。

~~~ts
interface Clock {
  now(): Date;
}

class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
~~~

参数属性可在构造参数上使用 readonly 等修饰符。私有字段的运行时保护与普通 private 关键字不同，具体需求应选合适机制。

## 声明约束不会自动生成实现

- implements 不会自动把接口属性生成到类中。
- private 的类型限制不等于授权或安全边界。
- React 组件通常使用函数组件，不需要写 class 组件。

## 动手验证

定义一个 Clock 接口和固定时间的测试实现；让业务函数依赖接口，而不是直接调用系统时间。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：工具类型、模板字面量与 satisfies](/notes/typescript-24-template-utility-types) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：声明文件：编译器从哪里认识一个 JavaScript 包](/notes/typescript-26-declarations)

