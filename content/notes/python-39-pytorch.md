---
title: "Python 39：PyTorch：张量、梯度和训练循环怎么连起来"
date: "2026-11-12"
excerpt: "看训练代码时，我会先跟踪数据的 shape、dtype 和 device，再看损失怎么传回模型参数。反向传播只负责算梯度，真正更新参数的步骤还在优化器里。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

看训练代码时，我会先跟踪数据的 shape、dtype 和 device，再看损失怎么传回模型参数。反向传播只负责算梯度，真正更新参数的步骤还在优化器里。

PyTorch 把神经网络计算表示为张量运算。张量的形状、类型和设备必须匹配；`Dataset` 表示样本，`DataLoader` 负责批次和打乱；`autograd` 根据前向计算自动求梯度。

```python
import torch

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]], requires_grad=True)
loss = (x * x).mean()
loss.backward()
print(x.grad)
```

训练的一般循环：清除旧梯度 → 前向计算 → 计算损失 → 反向传播 → 优化器更新。评估时调用 `model.eval()` 并使用 `torch.no_grad()`。

全连接网络适合把固定长度特征映射到输出；图像常用卷积层提取局部空间特征，文本或序列任务常用注意力模型。深度学习还要区分训练、验证和测试数据：验证集用于选择结构和超参数，测试集留到最后评估。数据增强、预训练模型和 GPU 可在基础训练流程稳定后再学。

## 形状不匹配和梯度累积要分别排查

张量形状不匹配是常见错误；打印 `shape`、`dtype`、`device` 逐步定位。梯度会累积，所以每轮通常先 `optimizer.zero_grad()`。

## 动手验证

**练习：**`loss.backward()` 做了什么？

**答案：**沿计算图对叶子张量计算梯度，并把结果写入其 `.grad`；它不会自动更新模型参数，更新由优化器完成。

---

[上一篇：用 Iris 数据走一遍训练、评估和模型保存](/notes/python-38-ml-project) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 PyTorch 训练一个手写数字分类器](/notes/python-40-dl-project)

