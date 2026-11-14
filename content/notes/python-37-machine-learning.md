---
title: "Python 37：机器学习流程：先分数据，再比较模型"
date: "2026-11-12"
excerpt: "模型能把见过的样本答对，为什么还不能说明它有用？从Iris分类出发，解释训练、标准化、交叉验证和独立测试各自在回答什么问题，以及数据泄漏怎样让分数变得不可信。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

给模型一批花的尺寸和品种，再拿同一批花考它，答对很多并不奇怪。问题是换一朵没见过的花，它还能不能判断对？机器学习真正要检查的，是学到的规律能否用于新样本。

先把任务说具体。Iris数据中，每行是一朵花，四个输入特征是萼片、花瓣的长度和宽度，目标是三个品种之一。输入通常记为 `X`，已知答案记为 `y`。用成对的输入与答案学习，这是监督学习；预测类别叫分类，预测连续数值叫回归。没有答案、只想找相似样本或压缩特征，则属于另一类问题，不能直接用分类准确率评价。

## fit究竟在学什么

scikit-learn中的 `fit` 根据数据确定参数，`predict` 使用已确定的规则给出预测。逻辑回归虽然名字带“回归”，这里用于分类：它学习输入特征到类别分数的关系，再转换成类别概率。k近邻则保留训练样本，预测时根据附近样本的标签投票。两个模型对“相近”和“规律”的表达方式不同，适合拿来比较。

在比较前还要处理单位。假如一个特征以毫米记录，另一个以米记录，直接算欧氏距离，数值范围大的特征就可能主导结果。`StandardScaler.fit` 会从训练数据计算每列均值和尺度，`transform` 再按照这些值转换输入。它也是从数据学习的一步，并非与训练无关的格式整理。

因此不能先用全量样本标准化，再拆分数据。那样测试样本已经参与了均值与尺度计算，测试就提前透露了信息。更可靠的做法是先留下测试集，再把预处理和分类器放到同一管线中。

## 先留出最后的考题

安装依赖 `python -m pip install scikit-learn` 后，下面的例子可以离线运行。先比较“永远猜多数类”与两种模型，避免只因为分数看起来高，就认为学到了有用规律：

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.dummy import DummyClassifier

data = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.25, random_state=42, stratify=data.target
)

candidates = {
    "majority": DummyClassifier(strategy="most_frequent"),
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

`stratify` 尽量维持各品种在两份数据中的比例，`random_state` 让这次拆分可重现。它们没有保证这个小数据集代表未来所有花朵，只是把当前实验条件固定下来。

`cv=5` 在训练数据内部做五折交叉验证：每次拿四份拟合，一份验证，轮换后汇总分数。管线会在每一折自己的训练部分拟合标准化，验证部分只做转换。这样选出的候选，才没有提前使用那一折的验证统计量。

选好模型后，再用完整训练集拟合一次，最后对保留的测试集预测。交叉验证均值用于选择，最后测试分数用于估计这套已选流程的表现；二者回答的问题不同。根据测试结果反复换参数、选特征，也会逐渐把测试集变成另一份训练材料。

## 分数要对应犯错的后果

Iris类别较均衡，准确率适合作为入门指标。若一千笔交易只有十笔欺诈，全部预测正常就有99%准确率，却一笔欺诈也找不出。召回率关心真正的目标中找到了多少，精确率关心报出来的目标中有多少是真的；阈值改变时，二者通常也会变化。应按漏报与误报的代价选择指标，再在验证数据上选择阈值。

回归任务则常检查MAE与RMSE。前者直接平均绝对误差，后者先平方再平均、开方，更容易受大误差影响。报告分数要带上单位和对照，预测房价误差一万元与预测温度误差一万度显然不是同一个量级的问题。

拆分方式也由使用场景决定。预测下个月的销量，应沿时间向前验证；同一个人的多次测量，要防止同一个人同时出现在训练和测试中。随机拆行只适合样本依赖关系允许这样做的情况，管线本身修复不了错误的拆分。

走完这些步骤，得到的仍是预测证据，不能仅凭某个特征能提高分数，就认定改变这个特征会改变结果。下一篇把候选收敛为逻辑回归，继续看参数选择、逐类错误和保存后的预测是否一致。

---

[上一篇：把订单 CSV 整理成能重跑的销售分析](/notes/python-36-analysis-project) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 Iris 数据走一遍训练、评估和模型保存](/notes/python-38-ml-project)

