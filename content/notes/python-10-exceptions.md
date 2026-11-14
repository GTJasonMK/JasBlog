---
title: "Python 10：异常处理：在哪里接住失败"
date: "2026-11-12"
excerpt: "异常处理要回答的是：这一层能不能对失败做出有意义的处理。能给出输入提示就转换成清楚的错误，不能恢复就保留原因往外抛，别用一个空的 except 把失败藏起来。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

异常处理要回答的是：这一层能不能对失败做出有意义的处理。能给出输入提示就转换成清楚的错误，不能恢复就保留原因往外抛，别用一个空的 except 把失败藏起来。

异常表示操作没有按预期完成。`try/except` 应围绕可预期的失败边界，捕获具体异常并给出有用处理；`raise` 用于拒绝无效状态，`finally` 用于无论结果如何都要执行的清理。

```python
def parse_age(text):
    try:
        age = int(text)
    except ValueError as exc:
        raise ValueError("年龄必须是整数") from exc
    if age < 0:
        raise ValueError("年龄不能为负数")
    return age
```

使用 `with` 管理文件等资源，比手动写 `try/finally` 更安全。错误信息应包含可行动的信息，但不要泄露密码、令牌或个人数据。

## 捕获异常后要有明确动作

裸 `except:` 会捕获 `KeyboardInterrupt` 等非业务异常，也会隐藏错误。不要用 `except Exception: pass` 制造假成功。

## 动手验证

**练习：**调用 `parse_age("abc")` 会发生什么？

**答案：**抛出 `ValueError("年龄必须是整数")`，并保留原始转换错误作为异常原因。

---

[上一篇：参数、闭包与函数式工具](/notes/python-09-functions-advanced) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：文件、路径与编码：先确认读写的对象](/notes/python-11-files-paths)

