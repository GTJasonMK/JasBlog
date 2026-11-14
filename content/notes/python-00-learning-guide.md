---
title: "Python 学习笔记：目录与阅读路线"
date: "2026-11-12"
excerpt: "从改一个列表为什么影响另一个变量，到脚本怎样处理文件、服务怎样保存请求，把Python学习中互相依赖的几条线串起来。可以按顺序读，也可以从手头的问题返回相应章节。"
tags: [ "Python" ]
category: "python"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

能照着例子写出循环以后，常常又会遇到另一种困难：换了一点输入，结果就解释不通。列表赋给另一个名字，修改后为什么一起变；函数默认列表为什么记住上次调用；程序能在自己电脑运行，换个环境为什么导入失败。这些问题彼此有联系，背更多API通常绕不过它们。

这组笔记先从对象、绑定与控制流程解释程序怎样执行，再看函数、模块和类怎样组织状态，之后处理依赖、测试、边界与并发。后面的应用项目建立在这些机制上，尽量让每段代码的行为都能回到前面的概念。

第一次接触Python，从01到16顺着运行例子。已经能写脚本但难以维护，可以先读21到26，把环境、测试和包交付连起来；有明确任务时，先选应用项目，再回查不懂的前置知识。不是学完所有机制才允许做项目，也不必先把整套第三方库装完。

## 语言基础

[查看这个分类](/notes?category=python-part1)

- [01 先把解释器和运行方式弄清楚](/notes/python-01-environment)
- [02 变量、对象与赋值：改的是名字，还是对象](/notes/python-02-objects)
- [03 数字、真假值与类型转换](/notes/python-03-basic-types)
- [04 字符串：从切片到编码和格式化](/notes/python-04-strings)
- [05 列表、元组和解包该怎么选](/notes/python-05-sequences)
- [06 字典与集合：查找、去重和成员判断](/notes/python-06-mappings-sets)
- [07 条件、循环与推导式：把处理过程写清楚](/notes/python-07-control-flow)
- [08 函数、返回值与作用域](/notes/python-08-functions)

## 函数与程序组织

[查看这个分类](/notes?category=python-part2)

- [09 参数、闭包与函数式工具](/notes/python-09-functions-advanced)
- [10 异常处理：在哪里接住失败](/notes/python-10-exceptions)
- [11 文件、路径与编码：先确认读写的对象](/notes/python-11-files-paths)
- [12 JSON、CSV 与序列化边界](/notes/python-12-data-formats)
- [13 模块、导入与程序入口](/notes/python-13-modules-imports)
- [14 类、属性与数据类：什么时候需要一个对象](/notes/python-14-classes)
- [15 组合、继承与协议：依赖需要的行为](/notes/python-15-composition-inheritance)
- [16 迭代器与生成器：数据不必一次准备好](/notes/python-16-iterators-generators)

## 标准库与工程实践

[查看这个分类](/notes?category=python-part3)

- [17 装饰器与上下文管理器：把公共动作放在合适的位置](/notes/python-17-decorators-context)
- [18 常用标准库：先看操作，再选工具](/notes/python-18-standard-library)
- [19 正则、日期与时间：格式之外还有语义](/notes/python-19-regex-datetime)
- [20 命令行、子进程和 HTTP：处理外部输入](/notes/python-20-cli-http)
- [21 虚拟环境与项目结构：让依赖跟着项目走](/notes/python-21-environments-projects)
- [22 类型标注能检查什么，又不能检查什么](/notes/python-22-typing)
- [23 用 pytest 把预期行为留下来](/notes/python-23-testing)
- [24 调试、日志与配置：留下能解释问题的信息](/notes/python-24-debugging-logging)
- [25 用 pyproject.toml 把项目变成可安装的包](/notes/python-25-packaging)
- [26 Git、依赖与安全：守住几条输入边界](/notes/python-26-git-security)

## 运行机制与并发

[查看这个分类](/notes?category=python-part4)

- [27 浅拷贝与深拷贝：到底复制到了哪一层](/notes/python-27-references-copy)
- [28 特殊方法：让自定义对象用起来像 Python 对象](/notes/python-28-data-model)
- [29 描述符与元类：先看它们介入了哪一步](/notes/python-29-descriptors-metaclasses)
- [30 性能与内存：先找到真正耗时的地方](/notes/python-30-performance)
- [31 线程、进程与 GIL：从任务在等什么说起](/notes/python-31-concurrency)
- [32 asyncio：await 在什么地方让出执行权](/notes/python-32-asyncio)

## 应用与项目

[查看这个分类](/notes?category=python-part5)

- [33 自动化脚本：先让任务能安全重跑](/notes/python-33-automation)
- [34 写一个订单 ETL 工具：读取、校验、转换和输出](/notes/python-34-etl-project)
- [35 NumPy、pandas 与图表：从数据形状开始分析](/notes/python-35-data-analysis)
- [36 把订单 CSV 整理成能重跑的销售分析](/notes/python-36-analysis-project)
- [37 机器学习流程：先分数据，再比较模型](/notes/python-37-machine-learning)
- [38 用 Iris 数据走一遍训练、评估和模型保存](/notes/python-38-ml-project)
- [39 PyTorch：张量、梯度和训练循环怎么连起来](/notes/python-39-pytorch)
- [40 用 PyTorch 训练一个手写数字分类器](/notes/python-40-dl-project)
- [41 FastAPI：一次请求如何经过校验和业务处理](/notes/python-41-backend)
- [42 用 FastAPI 和 SQLite 做一个任务 API](/notes/python-42-backend-project)
- [43 采集、办公、GUI 与科学计算：Python 的几条延伸方向](/notes/python-43-other-domains)

## 配套资料

- [Python 资料索引与常用工具](/notes/python-reference)

## 示例怎么运行

语法示例面向 Python 3.12 及以上版本。应用示例需要的第三方依赖和运行命令放在相应文章里，代码片段与完整项目示例分开说明。

阅读代码时先猜输出，再运行核对。猜错以后沿着输入、对象和操作顺序追踪差异，比把最终输出背下来更能发现理解缺口。文件和数据库练习使用临时目录或独立学习数据，先确认操作对象，再执行会写入的步骤。

应用部分可以按交付物选择：34生成订单CSV，36生成汇总与图表，38保存可重载分类管线，40训练数字分类网络，42提供有测试的任务API。每个项目各自说明范围，不代表已经具备正式服务的全部能力。完成一个小项目后再检查失败输入、重复运行与环境复现，才能知道自己掌握到哪一步。

