---
title: "Python 28：特殊方法：让自定义对象用起来像 Python 对象"
date: "2026-11-12"
excerpt: "len、for、in 为什么能直接用于某些自定义类？用一份播放列表说明特殊方法怎样接入语言协议，再看调试显示、相等与哈希的约定，避免做出看起来支持某个操作却含义不同的对象。"
tags: [ "Python", "运行机制与并发" ]
category: "python-part4"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

列表能交给 `len`、能用 `for` 遍历，自定义的播放列表是否也能这样用？如果对象确实表达“一组歌曲”，让它接入Python已有的操作方式，比再提供一套含义相同的 `get_song_count` 和 `get_all_songs` 更方便使用。

这种接入由数据模型中的特殊方法完成。它们通常以双下划线开头和结束，语言的内置操作会按约定查找它们：

```python
class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __iter__(self):
        return iter(self._songs)


playlist = Playlist(["A", "B"])
print(len(playlist))       # 2
print(list(playlist))      # ['A', 'B']
print("A" in playlist)    # True
```

`__len__` 提供元素数量，`__iter__` 返回一个迭代器。`for` 和 `list(...)` 可以据此取得歌曲；没有专门的 `__contains__` 时，`in` 也可以逐项查找。这说明不用为了接入所有相关操作而先把全部特殊方法写一遍。

这里在初始化时复制了外层列表，所以外部原列表的增删不会直接改变播放列表。若歌曲对象本身可变，它们仍可能共享，复制的边界见[上一篇](/notes/python-27-references-copy)。

## 调用形式相似，语义也要配得上

`len(obj)` 使用长度协议，但不能简单认为所有场景都只是普通地执行一次 `obj.__len__()`。许多特殊操作会从对象类型上查找相应方法，而不按普通实例属性查找的全部方式处理。通常通过 `len`、`for` 等公开语法使用它们，不在业务代码里反复直接调用双下划线方法。

`__len__` 应返回非负整数；如果一个“长度”方法每次都访问远程接口，也会让使用者难以判断成本。对象支持某个语法，不只有方法名字对上，还要符合这种操作常见的含义和使用预期。

若常常按歌曲ID查找，可以维护适合查询的结构，或者实现有明确含义的 `__contains__`。当前对象只有两首歌，迭代已经够用，不需要为一个不存在的性能问题增加另一份同步状态。

`__getitem__` 可以让对象支持下标或切片，`__enter__`、`__exit__` 支持上下文管理。各个协议各有用途，不必因为“这是一个完整的类”就实现并不需要的能力。

## 打印出来给谁看

`__repr__` 提供便于调试的表示，`__str__` 提供面向展示的文本。例如：

```python
class Label:
    def __init__(self, text):
        self.text = text

    def __repr__(self):
        return f"Label({self.text!r})"

    def __str__(self):
        return self.text

label = Label("Python")
print(label)        # Python
print(repr(label))  # Label('Python')
```

`!r` 使用内部值的调试表示，保留引号等线索。调试表示应尽量可辨认，但并不要求所有对象都能通过 `eval(repr(obj))` 恢复，更不应为了调试显示泄露凭证或用户隐私。

## 相等比较和哈希要遵守同一套规则

普通自定义对象默认的相等判断与身份相关。若要让两个坐标只要分量相同就算相等，可以使用数据类生成值比较：

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int

first = Point(3, 5)
second = Point(3, 5)
print(first == second)             # True
print(hash(first) == hash(second)) # True
print(len({first, second}))        # 1
```

相等的可哈希对象必须具有相同哈希值，反过来则不成立，哈希冲突是允许的。作为字典键或集合成员期间，影响相等和哈希的字段也应保持稳定，不能插入以后再改变它们。

这也是重写 `__eq__` 却不正确处理 `__hash__` 容易出问题的原因。Python对许多这种类默认禁用哈希，避免把可变值比较对象当作稳定的键。是否应该可哈希，要从对象用途决定，而不只是为了消除一次“unhashable”报错。

运算符方法也应遵守对应约定。实现 `__add__` 时遇到不支持的另一类型，返回 `NotImplemented` 可以让解释器继续尝试其他比较或运算路径；它与主动抛出的 `NotImplementedError` 不是同一用途。日常业务没有自定义加法含义，就不需要让一个对象支持 `+`。

数据模型让自定义对象与语言协作。最实用的做法是从调用者实际需要的操作开始，确认含义、成本和失败方式，再实现对应协议，而不是先为类列一张双下划线方法清单。

---

[上一篇：浅拷贝与深拷贝：到底复制到了哪一层](/notes/python-27-references-copy) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：描述符与元类：先看它们介入了哪一步](/notes/python-29-descriptors-metaclasses)

