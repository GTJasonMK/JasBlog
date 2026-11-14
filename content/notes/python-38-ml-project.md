---
title: "Python 38：用 Iris 数据走一遍训练、评估和模型保存"
date: "2026-11-12"
excerpt: "Iris 的数据量不大，适合把整条训练流程看清楚。我会把拆分、标准化、模型选择和最终评估分开，保存时连同预处理一起保存，避免预测阶段换了一套输入规则。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

Iris 的数据量不大，适合把整条训练流程看清楚。我会把拆分、标准化、模型选择和最终评估分开，保存时连同预处理一起保存，避免预测阶段换了一套输入规则。

数据直接取自 scikit-learn 内置的 Iris 数据集，无需下载外部文件。

安装依赖：`python -m pip install scikit-learn joblib`。

```python
from joblib import dump
from sklearn.datasets import load_iris
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

data = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.25, random_state=42, stratify=data.target
)
pipeline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
search = GridSearchCV(
    pipeline,
    {"logisticregression__C": [0.1, 1.0, 10.0]},
    cv=5,
    scoring="accuracy",
)
search.fit(X_train, y_train)
model = search.best_estimator_
print(search.best_params_, search.best_score_)
predicted = model.predict(X_test)
print(classification_report(y_test, predicted, target_names=data.target_names))
print(confusion_matrix(y_test, predicted))
dump(model, "iris_model.joblib")
```

保存整个管线可确保推理时使用相同的标准化步骤。只加载来自可信来源的 pickle/joblib 文件，因为反序列化不可信文件可能执行代码。

## 运行后检查

- 测试数据没有参与预处理拟合或模型选择。
- 记录随机种子、模型、指标和数据集来源。
- 混淆矩阵的行列与类别顺序一致。

## 测试集不参与反复调参

不要根据测试集分数反复调参；网格搜索只看训练集内部的交叉验证结果。标准化放在 `Pipeline` 内，确保每个折只用自己的训练部分拟合。

## 动手验证

**练习：**替换逻辑回归为随机森林时，是否还需要标准化？

**答案：**通常不需要。先 `from sklearn.ensemble import RandomForestClassifier`，再把管线改成 `make_pipeline(RandomForestClassifier(random_state=42))`；仍用训练集交叉验证比较，再对测试集评估一次。

---

[上一篇：机器学习流程：先分数据，再比较模型](/notes/python-37-machine-learning) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：PyTorch：张量、梯度和训练循环怎么连起来](/notes/python-39-pytorch)

