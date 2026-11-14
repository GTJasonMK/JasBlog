---
title: "Python 38：用 Iris 数据走一遍训练、评估和模型保存"
date: "2026-11-12"
excerpt: "同一个分类器换个参数，分数为什么会变化？用Iris的四个测量值串起网格搜索、逐类评估和模型保存，再检查重新加载以后是否真的沿用了同一套输入转换。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

上一篇比较了不同模型，这次只保留逻辑回归。问题随之变小：同一种模型还有不同参数，应该拿什么数据选？选完以后，怎样知道它具体错在哪个品种上？

Iris内置数据有150个样本，每个样本包含四个以厘米计的测量值，目标是三个品种编号。它很适合观察整条流程，但样本少、任务简单，不能用它的分数证明某种模型普遍更强。

## 参数选择也放在训练集内部

逻辑回归中的 `C` 控制正则化强弱，值越小，约束通常越强。它影响模型对当前训练数据的贴合程度，却不是“越大越准确”的旋钮。下面只比较三个预先选定的值，用训练集内部交叉验证决定保留哪个。

安装依赖 `python -m pip install scikit-learn joblib` 后运行完整脚本，不需要下载数据：

```python
from joblib import dump, load
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
restored = load("iris_model.joblib")
assert (restored.predict(X_test) == predicted).all()
```

`logisticregression__C` 中的双下划线，把参数名定位到管线里的逻辑回归步骤。标准化与分类器仍然绑定，每一折先用本折训练数据计算尺度，再训练模型，不能把标准化提前挪到网格搜索外部。

`GridSearchCV` 默认会把得分最好的参数重新拟合到完整训练集上，因此 `best_estimator_` 已经可预测，不需要再用测试数据调用 `fit`。`best_score_` 是选择过程中的交叉验证均值，下面打印的分类报告才来自保留的测试集。

## 不只看一行准确率

混淆矩阵默认按类别编号排列，行表示真实类别，列表示预测类别。对角线上是正确分类，偏离对角线的位置告诉我们哪两个品种容易混淆。阅读时要和 `data.target_names` 的顺序一起看，不能只凭矩阵某一格的位置猜品种。

分类报告中的precision衡量某个预测类别有多可靠，recall衡量某个真实类别被找回多少，support则是该类测试样本数。测试集总共只有38个样本，一次多错一个就会明显改变总分，所以不要把小数点后的微小差异解释成稳定优势。

若确实要研究稳定性，应在训练部分设计重复验证或嵌套验证，并记录选择过程。不能换几十个随机种子，只展示最满意的一次测试分数。测试结果一旦参与选择，它的独立评估含义就已经改变。

## 为什么连标准化一起保存

模型收到的新样本仍然应该是原始厘米数值。管线先调用已经拟合的标准化器，再交给分类器；只保存分类器、预测前另算一套均值，会改变输入含义。代码保存整个管线，并断言重载后对同一测试集给出相同类别，这验证了这次保存与加载的行为。

这条断言没有验证未来环境兼容性。交付时还需要保存四个特征的名称、顺序、单位、训练数据来源和依赖版本。只拿到一个长度为4的数组，程序无法判断调用方是不是把花瓣宽度放到了萼片长度的位置。真实接口应先按字段合同解析，再按固定顺序组成输入。

joblib基于Python对象序列化，只能加载可信来源的文件，不接收用户随意上传的模型文件直接反序列化。重新训练时也应重新记录版本与实验条件，不假定一个旧文件能够跨所有环境永久复用。

如果改用随机森林，通常可以去掉标准化，因为树主要比较特征与切分阈值的大小关系。仍然要在训练集内部选择参数，再用独立测试集评估。预处理随模型变化，数据划分的职责不会因此变化。

---

[上一篇：机器学习流程：先分数据，再比较模型](/notes/python-37-machine-learning) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：PyTorch：张量、梯度和训练循环怎么连起来](/notes/python-39-pytorch)

