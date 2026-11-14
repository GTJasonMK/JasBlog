---
title: "Python 37：机器学习流程：先分数据，再比较模型"
date: "2026-11-12"
excerpt: "训练分数高不高之前，我会先检查测试数据有没有被提前看见。标准化、缺失值处理和模型选择都可能泄漏信息，所以它们应该和训练数据一起进入管线。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

训练分数高不高之前，我会先检查测试数据有没有被提前看见。标准化、缺失值处理和模型选择都可能泄漏信息，所以它们应该和训练数据一起进入管线。

传统机器学习常用 scikit-learn。其基本接口是估计器的 `fit`（学习参数）、`predict`（预测）和转换器的 `transform`（预处理）。监督学习有标签；无监督学习从输入中找结构。

可靠流程：先定义目标和评价指标 → 划分训练/测试数据 → 只在训练数据上拟合预处理 → 在训练集内用交叉验证比较候选模型 → 最后在测试集评估一次。测试集只用于最后一次评估。

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier

data = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.25, random_state=42, stratify=data.target
)

candidates = {
    "logistic": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "knn": make_pipeline(StandardScaler(), KNeighborsClassifier()),
}
scores = {
    name: cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy").mean()
    for name, model in candidates.items()
}
best_name = max(scores, key=lambda name: scores[name])
model = candidates[best_name]
print(scores)

model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(f"最终测试准确率：{(predictions == y_test).mean():.3f}")
```

`Pipeline` 把预处理与模型绑定，降低交叉验证中数据泄漏的风险。分类需考虑准确率、精确率、召回率、F1；回归常看 MAE、RMSE 等。

## 预处理也不能提前接触测试集

不能先用全量数据计算均值或填补缺失，再拆分训练集和测试集；测试数据的信息会泄漏到训练流程。

## 动手验证

**练习：**类别严重不平衡时，为什么仅看准确率可能误导？

**答案：**模型只预测多数类也可能得到高准确率；还应检查各类召回率、精确率或 F1，并说明业务代价。

---

[上一篇：把订单 CSV 整理成能重跑的销售分析](/notes/python-36-analysis-project) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 Iris 数据走一遍训练、评估和模型保存](/notes/python-38-ml-project)

