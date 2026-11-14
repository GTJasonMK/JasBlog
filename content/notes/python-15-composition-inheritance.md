---
title: "Python 15：组合、继承与协议：依赖需要的行为"
date: "2026-11-12"
excerpt: "通知功能需要的是“能发送消息”，不一定要知道发送者属于哪个继承体系。我更愿意先把需要的行为说清楚，再决定用组合、协议还是继承来表达。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

通知功能需要的是“能发送消息”，不一定要知道发送者属于哪个继承体系。我更愿意先把需要的行为说清楚，再决定用组合、协议还是继承来表达。

组合是让一个对象持有另一个对象并委托工作；继承表达“是一种”的关系。优先组合，只有子类确实能替代父类并遵守相同约定时才继承。协议描述对象需要提供哪些行为，不要求共享某个父类。

```python
class EmailSender:
    def send(self, message: str) -> None:
        print(f"发送邮件：{message}")


class Notifier:
    def __init__(self, sender):
        self.sender = sender

    def notify(self, message: str) -> None:
        self.sender.send(message)
```

`Notifier` 依赖 `send` 行为，而非特定供应商类；测试时可传入简单替身。

## 继承层次深了，行为也更难追踪

深层继承链会让行为难以追踪。若子类必须覆盖父类很多方法才能工作，通常说明抽象边界不合适。

## 动手验证

**练习：**如何测试 `Notifier` 而不发送真实邮件？

**答案：**传入一个带 `send` 方法的假对象，记录收到的消息，再断言消息内容。

---

[上一篇：类、属性与数据类：什么时候需要一个对象](/notes/python-14-classes) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：迭代器与生成器：数据不必一次准备好](/notes/python-16-iterators-generators)

