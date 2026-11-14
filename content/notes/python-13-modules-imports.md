---
title: "Python 13：模块、导入与程序入口"
date: "2026-11-12"
excerpt: "我希望一个模块被导入时，能安全地提供函数和类型，而不是突然开始读文件、问用户要输入。把运行入口收进 main，是控制这类副作用的简单办法。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

我希望一个模块被导入时，能安全地提供函数和类型，而不是突然开始读文件、问用户要输入。把运行入口收进 main，是控制这类副作用的简单办法。

模块通常对应一个 `.py` 文件。把相关函数放入模块，再由入口脚本调用，可以降低文件间耦合。`import module` 保留命名空间；`from module import name` 直接导入名称，使用时要避免覆盖内置名。

```python
# app.py
def main():
    print("运行主程序")


if __name__ == "__main__":
    main()
```

当文件被直接执行时，`__name__` 为 `"__main__"`；作为模块导入时则为模块名。把副作用放在 `main()` 中，可避免导入文件时意外启动程序。

## 脚本名称可能遮住标准库

不要把自己的脚本命名为 `random.py`、`json.py` 等标准库模块名，否则导入时可能遮蔽标准库。

## 动手验证

**练习：**为什么模块导入时不应立即读取用户输入？

**答案：**导入应主要负责定义可复用对象；读取输入属于运行副作用，会让测试和其他调用者无法安全复用该模块。

---

[上一篇：JSON、CSV 与序列化边界](/notes/python-12-data-formats) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：类、属性与数据类：什么时候需要一个对象](/notes/python-14-classes)

