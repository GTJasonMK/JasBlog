---
title: "Python 29：描述符与元类：先看它们介入了哪一步"
date: "2026-11-12"
excerpt: "写 item.weight = 2 时，为什么可以自动触发校验？从属性访问追到描述符，再把它与类创建时运行的元类区分开，解释 property、共享字段规则和显式注册各自适合解决的问题。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一个对象有重量、长度和宽度，三个字段都要求是正整数。分别写三个setter可以实现，但规则一旦变化，就要改三处。如果把“正整数属性”定义为一个可复用对象，再让属性读取和赋值经过它，同一条规则就能用于多个字段。

描述符提供的正是这种介入属性访问的机制。实现 `__get__`、`__set__` 或 `__delete__` 等协议方法的对象，放在类的属性上时，可以参与对应的读取、赋值或删除：

```python
class Positive:
    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        try:
            return instance.__dict__[self.name]
        except KeyError:
            raise AttributeError(self.name) from None

    def __set__(self, instance, value):
        if type(value) is not int or value <= 0:
            raise ValueError("值必须为正整数")
        instance.__dict__[self.name] = value
```

把它用于一个类：

```python
class Measurement:
    weight = Positive()
    width = Positive()


item = Measurement()
item.weight = 2
print(item.weight)  # 2
```

创建 `Measurement` 类时，`__set_name__` 得到所属类和属性名，分别记录 `weight`、`width`。执行 `item.weight = 2` 时，`Positive.__set__` 检查输入，再把值保存在这个实例自己的 `__dict__` 中。

描述符对象是类级共享的，但被管理的字段值属于各实例，不能把每个实例的值都存到描述符的一个普通属性里，否则不同实例会覆盖彼此。这个例子使用实例字典，因此也没有承诺支持完全不提供 `__dict__` 的其他对象布局。

读取尚未赋值的属性时，`__get__` 抛出 `AttributeError`，符合属性不存在的语义。`Measurement.weight` 这种类级访问没有实例，返回描述符自身，可以保留类级检查和工具访问的能力。

## 为什么把规则放在类上才生效

描述符通过类属性参与实例属性查找。把一个 `Positive()` 随便放进实例字典，并不等于这个实例属性自动取得了描述符协议。

实现 `__set__` 或 `__delete__` 的数据描述符，在常规属性查找中优先于实例字典中的同名项；只有 `__get__` 的非数据描述符则有不同优先级。普通方法的绑定、`property` 等行为，也与这套属性机制有关。

这不是要在业务代码里重写整套查找规则，而是解释为什么 `item.weight` 会经过某段逻辑。只管理一个字段时，`property` 已经很清楚；多个类型都要复用相同字段规则时，描述符才可能减少重复。

## 元类处理的不是实例属性访问

类本身也是对象，通常由 `type` 创建。元类可以参与类对象的创建，例如检查类体里有哪些声明、调整定义或登记新类。它发生的时机与 `item.weight` 的读写不同。

下面这个最小例子只在创建类时检查它有没有声明名称：

```python
class NamedType(type):
    def __new__(mcls, name, bases, namespace):
        if "label" not in namespace:
            raise TypeError("类需要声明label")
        return super().__new__(mcls, name, bases, namespace)

class Report(metaclass=NamedType):
    label = "report"

print(Report.label)  # report
```

这条检查会在执行 `class Report` 时发生，甚至还没创建任何 `Report()` 实例。框架可以借助这种能力收集字段或注册模型，但使用者需要知道类定义时会触发哪些规则。

这里的示例要求每个类都在自己的类体里声明 `label`，不把继承来的属性算作满足条件。真实框架如果允许继承，就需要定义另一套检查规则。元类能够干预创建过程，并不意味着示例中的策略适合所有类型体系。

## 需要统一处理，不一定就需要元类

类装饰器可以在类创建后调整或注册它，`__init_subclass__` 可以在派生子类时执行一些约定，普通字典则能做最明确的注册表。没有必要仅为了省掉一条显式注册语句，就把整个系统放进自定义元类。

把介入时机分开，选择会清楚很多：一项属性的读取与写入需要复用规则，考虑描述符；类定义本身需要统一处理，再比较类装饰器、子类钩子或元类。普通函数、数据类和组合已经能把规则写明白时，保留它们通常更容易追踪代码实际做了什么。

---

[上一篇：特殊方法：让自定义对象用起来像 Python 对象](/notes/python-28-data-model) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：性能与内存：先找到真正耗时的地方](/notes/python-30-performance)

