---
title: "Python 40：用 PyTorch 训练一个手写数字分类器"
date: "2026-11-12"
excerpt: "一张8×8灰度图怎样变成十个类别分数？用内置手写数字数据走完卷积、批量训练、验证和保存，把每层形状以及损失函数接收的输入讲清楚。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

看到一张手写的7，人会凭笔画认出来；程序先收到的却是64个像素值。这个项目要让网络把一张8×8灰度图映射成0到9的类别，同时保留像素的二维位置关系。

数据来自scikit-learn内置的digits，共1797张图，不需要联网下载。像素值原本在0到16之间，除以16将其缩放到0到1。这里的16来自数据定义，不是从全部样本估计的统计量，因此与先用全量数据拟合标准化器不是同一种操作。

先留下20%测试数据，再从剩余部分取20%作为验证数据。训练集用于求梯度，验证集用于观察训练过程，最后才读取测试表现。固定随机种子帮助复查实验，但不同设备与库版本仍可能产生不同结果。

## 从图像形状读懂网络

灰度图只有一个通道，批次输入是 `(N, 1, 8, 8)`。第一层用8个3×3卷积核提取局部模式，padding为1让高宽保持8；池化把高宽各减半，得到 `(N, 8, 4, 4)`；展平后每张图有128个特征，最后线性层输出10个类别分数。

这些分数是logits，不要求在0到1之间，也不要求和为1。`CrossEntropyLoss` 会处理相应的对数概率计算，因此不在它前面额外加softmax。标签是0到9的整数编号，所以采用 `torch.long`。

安装依赖：`python -m pip install torch scikit-learn`。CPU 即可运行。

```python
import numpy as np
import torch
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(7)
digits = load_digits()
X_train_val, X_test, y_train_val, y_test = train_test_split(
    digits.images / 16.0, digits.target, test_size=0.2,
    random_state=7, stratify=digits.target,
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.2, random_state=8, stratify=y_train_val
)

def make_loader(images, labels, *, shuffle):
    features = torch.tensor(np.expand_dims(images, axis=1), dtype=torch.float32)
    targets = torch.tensor(labels, dtype=torch.long)
    return DataLoader(TensorDataset(features, targets), batch_size=64, shuffle=shuffle)


train_loader = make_loader(X_train, y_train, shuffle=True)
val_loader = make_loader(X_val, y_val, shuffle=False)
test_loader = make_loader(X_test, y_test, shuffle=False)

model = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(8 * 4 * 4, 10),
)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(10):
    model.train()
    for features, labels in train_loader:
        features, labels = features.to(device), labels.to(device)
        optimizer.zero_grad()
        loss = loss_fn(model(features), labels)
        loss.backward()
        optimizer.step()

    model.eval()
    correct = total = 0
    with torch.no_grad():
        for features, labels in val_loader:
            features, labels = features.to(device), labels.to(device)
            predictions = model(features).argmax(dim=1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)
    print(f"epoch {epoch + 1}: validation accuracy={correct / total:.3f}")

model.eval()
correct = total = 0
with torch.no_grad():
    for features, labels in test_loader:
        features, labels = features.to(device), labels.to(device)
        predictions = model(features).argmax(dim=1)
        correct += (predictions == labels).sum().item()
        total += labels.size(0)
print(f"test accuracy: {correct / total:.3f}")

torch.save(model.state_dict(), "digits_model.pth")
restored = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Flatten(), nn.Linear(8 * 4 * 4, 10),
).to(device)
restored.load_state_dict(torch.load("digits_model.pth", map_location=device, weights_only=True))
restored.eval()
```

## 每轮训练具体改变了什么

一个epoch表示训练集被遍历一遍，每个批次都经历清梯度、前向、损失、反向和参数更新。`shuffle=True` 只用于训练，避免每轮始终按原顺序更新；验证和测试无需打乱，因为这里只有累计正确数，顺序不会改变这个指标。

验证阶段切到eval并关闭梯度，仅累计正确样本和总数。这里最后用正确数除以总数，不能把各批次准确率直接取普通平均，因为最后一个批次通常更小。训练10轮后保存的是第10轮参数，没有实现“挑验证分数最高的一轮”。若要按验证集选checkpoint，应保存当时的参数，再加载选中的checkpoint做一次测试。

这份脚本的目的在于观察完整流程，不预先承诺准确率。若修改层数、学习率或训练轮数，用验证集比较；若开始根据测试分数反复修改，原测试集就失去了独立性。

## 保存文件还不等于能恢复预测

`state_dict` 保存参数与注册的缓冲区，不包含完整网络定义。重建时必须提供同样结构，再加载状态。`map_location` 决定张量落到哪种设备，`weights_only=True` 限制加载内容；模型文件仍应来自可信来源。

在同一次脚本运行中接上这段，比较原模型与重载模型对同一图像的输出：

```python
with torch.no_grad():
    example = torch.tensor(
        np.expand_dims(X_test[:1], axis=1), dtype=torch.float32, device=device
    )
    predicted_digit = int(restored(example).argmax(dim=1).item())
    assert torch.allclose(model(example), restored(example))
print(predicted_digit)
```

输出的数字可以和 `y_test[0]` 对照，但一张预测正确不代表整个测试集正确，保存前后一致也不代表模型判断正确。这是两项独立检查：一项验证任务表现，一项验证交付过程有没有改变计算。

要处理自己的照片，还得解决输入分布：裁剪、灰度化、尺寸、背景和像素范围都需要与训练约定匹配。把一张任意照片缩成8×8，不保证它就像内置数据。先检查图像含义是否一致，再考虑更大的网络或GPU，才能知道后面的改动究竟在改善什么。

---

[上一篇：PyTorch：张量、梯度和训练循环怎么连起来](/notes/python-39-pytorch) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：FastAPI：一次请求如何经过校验和业务处理](/notes/python-41-backend)

