---
title: "Python 40：用 PyTorch 训练一个手写数字分类器"
date: "2026-11-12"
excerpt: "这个例子选用内置的 8×8 数字图像，把重点放在批处理、卷积输入、训练和评估上。我会保留训练、验证、测试三份数据各自的职责，最后再检查保存后的模型能否重新加载。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

这个例子选用内置的 8×8 数字图像，把重点放在批处理、卷积输入、训练和评估上。我会保留训练、验证、测试三份数据各自的职责，最后再检查保存后的模型能否重新加载。

图像直接取自 scikit-learn 内置的手写数字数据集，不需要联网下载。

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

模型保留图像高宽并使用卷积层。训练集用于梯度更新，验证集用于观察训练过程，测试集只用于最后评估。CPU 可以运行；有 CUDA 时会自动使用 GPU。

## 运行后检查

- 标签类型为 `long`，分类损失使用整数类别编号。
- 测试数据没有参与梯度更新。
- 保存和加载后，模型结构与参数形状一致。

## 测试集只能留作独立评估

卷积网络的输入形状是 `(batch, channel, height, width)`；这里用 `expand_dims` 把灰度图补成单通道。不要根据测试集反复调节 epoch 或模型结构，否则测试集不再是独立评估。

## 动手验证

**练习：**用加载后的模型预测一张测试图像。

```python
with torch.no_grad():
    example = torch.tensor(
        np.expand_dims(X_test[:1], axis=1), dtype=torch.float32, device=device
    )
    predicted_digit = int(restored(example).argmax(dim=1).item())
print(predicted_digit)
```

---

[上一篇：PyTorch：张量、梯度和训练循环怎么连起来](/notes/python-39-pytorch) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：FastAPI：一次请求如何经过校验和业务处理](/notes/python-41-backend)

