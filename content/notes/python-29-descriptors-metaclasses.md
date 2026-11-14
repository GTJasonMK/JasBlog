---
title: "Python 29：描述符与元类：先看它们介入了哪一步"
date: "2026-11-12"
excerpt: "描述符介入属性访问，元类介入类的创建。把介入的时机分开之后，这两个概念就没那么神秘了。不过普通业务用函数、property 或数据类已经足够时，我不会继续加这一层。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

描述符介入属性访问，元类介入类的创建。把介入的时机分开之后，这两个概念就没那么神秘了。不过普通业务用函数、property 或数据类已经足够时，我不会继续加这一层。

描述符通过 `__get__`、`__set__` 或 `__delete__` 控制属性访问。`property` 本身就是描述符的常见应用。元类控制类对象的创建，框架或 ORM 有时会用它注册字段和方法。

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
        if value <= 0:
            raise ValueError("值必须为正数")
        instance.__dict__[self.name] = value
```

描述符要作为类属性使用：

```python
class Measurement:
    weight = Positive()


item = Measurement()
item.weight = 2
print(item.weight)  # 2
```

尚未赋值时抛出 `AttributeError`，符合 Python 属性访问语义；赋入非正数时由 `__set__` 拒绝。

## 何时使用

普通业务代码优先使用函数、属性、数据类和组合。只有当需要统一控制大量属性访问或动态构造类时，才考虑描述符或元类。

## 先确认简单机制是否已经够用

元类会改变类创建过程，调试成本高。若简单基类、装饰器或显式注册表已经能解决问题，就不需要元类。

## 动手验证

**练习：**上例中 `__get__` 为什么在 `instance is None` 时返回描述符本身？

**答案：**类访问 `Class.attribute` 时没有实例；返回描述符可保留类级访问语义。

---

[上一篇：特殊方法：让自定义对象用起来像 Python 对象](/notes/python-28-data-model) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：性能与内存：先找到真正耗时的地方](/notes/python-30-performance)

