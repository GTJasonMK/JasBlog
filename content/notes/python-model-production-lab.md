---
title: "Python 模型交付：数据、评估、推理与回滚"
date: "2026-11-15"
excerpt: "沿固定版本完整工程解释业务边界、失败处理与验证，区分本地实测、配置检查和待运行场景。"
tags: ["Python", "工程实践"]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: "2026-11-15"
---

[下载 0.1.1 版完整源码](/downloads/jas-learning-v0.1.1.zip)，解压后从项目根目录按步骤运行。[版本与校验信息](/downloads/jas-learning-v0.1.1.json)。

保存模型文件以后，还要知道它接受什么输入、由哪份数据训练、在什么样本上验证，以及替换它失败时如何恢复。版本 0.1.0 用小时需求和真实田间图片分别完成这条路径，默认使用 CPU。

## 固定数据与许可

先按 Python 工程 README 安装锁定环境，然后在 JasLearning 根目录运行：

```bash
.venv/bin/python -m learning.datasets bike .local/data
.venv/bin/python -m learning.datasets beans-train .local/data
.venv/bin/python -m learning.datasets beans-validation .local/data
.venv/bin/python -m learning.datasets beans-test .local/data
```

python/datasets.json 固定 URL、SHA256、许可和资料来源。Bike Sharing 来自 UCI，许可 CC BY 4.0。Beans 来自 Makerere AI Lab 与 NaCRRI 合作采集的乌干达田间图片，许可 MIT，训练、验证、测试为提供方的既有划分。

Beans 原 Google Storage 地址因提供方账单关闭返回 403。本版明确使用原仓库链接的 Hugging Face 数据集，固定提交 27aa014ce09b193e1a6f58112d4a66e0eddb69c5 与三个 ZIP 摘要；运行时不自动换源。

datasets.py 检查下载大小、完整内容摘要、解压后大小和路径，拒绝绝对路径、上级目录与符号链接。校验成功才替换正式文件。已有压缩包不重复下载，已有包摘要不符则停止；测试和模型服务不会隐式下载数据。

## 下一小时需求预测

```bash
env OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 .venv/bin/python -m learning.forecast .local/data/bike/hour.csv .local/models/forecast-v1
```

forecast.py 将每行解释为当地某一小时的总租车量。原 CSV 没有时区偏移，工程显式按 America/New_York 转换；夏令时中无法确定的两个小时排除并计数，不猜它们的偏移。缺失小时保留缺失，不自动填成零。

模型只接收已知日历信息和 1、24、168 小时前的需求。casual 与 registered 是目标组成部分，不能当作预测特征；目标小时实际天气也没有被当作提前可知输入。按真实时间索引取滞后，不能把缺行以后的一行误当作一小时。

设目标为 yₜ，特征为日历与 yₜ₋₁、yₜ₋₂₄、yₜ₋₁₆₈。先用 yₜ₋₁₆₈ 作为季节性基线，再比较两个固定深度的 HistGradientBoostingRegressor。计数目标使用 Poisson 损失，避免输出负需求。

2012 年 10 月以前的数据做三折 TimeSeriesSplit，每折训练只使用过去，固定迭代次数，不用随机内部验证选择轮数。根据折均 MAE 选深度，最后用预留的 2012 年 10 至 12 月测试。滚动的一小时预测允许使用当时已经观察到的上一小时需求，不代表一次预测未来三个月。

MAE = Σ|yᵢ − ŷᵢ| / n；RMSE = √(Σ(yᵢ − ŷᵢ)² / n)。y 是实际租车量，ŷ 是预测量，n 是有效测试小时数。前者表示平均绝对偏差，后者对较大错误更敏感。报告还按当地小时拆开误差，避免平均值遮住上下班高峰。

模型、特征顺序、数据摘要、时区、选择过程和指标一起保存。相同目录、相同数据直接验证并复用产物；数据变化要求新版本目录。文件重载以后比较预测一致性，验证交付没有改变计算。

## 田间叶片图像分类

```bash
.venv/bin/python -m learning.vision .local/data/beans-train/train .local/data/beans-validation/validation .local/data/beans-test/test .local/models/vision-v1 --epochs 5
```

vision.py 用预训练 ResNet18 提取特征，只训练三分类输出层。冻结编码器并保持 eval，避免小数据改变 BatchNorm 统计量。训练使用裁剪和翻转，评估使用固定缩放、中心裁剪与同一归一化；服务调用相同评估变换。

类别按 angular_leaf_spot、bean_rust、healthy 固定顺序。标签顺序也是模型合同，不能只保存三个数字。读取前核对三个划分的精确图片摘要，发现交叉重复就停止。近重复、采集地和设备的独立性还需额外元数据，不能从现有划分推断所有地区都能泛化。

每个 epoch 保存参数、优化器、最佳验证参数与随机状态，原子替换 checkpoint。重启先核对参数与数据摘要，再从未完成轮次继续；已完成结果不重新训练。验证集选择最佳轮次，测试集仅用于最终报告。

报告包括逐类 precision、recall、F1 与混淆矩阵。recall = TP / (TP + FN)，表示真实属于该类的图片有多少被找回；precision = TP / (TP + FP)，表示报为该类的图片有多少正确。F1 = 2PR / (P + R)，宏平均对各类等权，不能用类别数量优势掩盖某一类失败。

--limit-per-class 只用于管线 smoke，报告明确标记 smoke_only。正式评估使用完整的 1034、133、128 张图片。固定种子帮助复查，不承诺跨版本逐位一致。

## HTTP 输入与服务资源

分别启动一个模型服务。开发环境默认只绑定本机：

```bash
env MODEL_PATH=.local/models/forecast-v1 MODEL_KIND=forecast .venv/bin/uvicorn learning.inference:factory --factory --host 127.0.0.1 --port 8001
env MODEL_PATH=.local/models/vision-v1 MODEL_KIND=vision .venv/bin/uvicorn learning.inference:factory --factory --host 127.0.0.1 --port 8002
```

forecast 的 POST /predict 接收带时区的 target 和 timestamp、count 历史列表。未来、重复、缺失和非有限输入明确拒绝。特征顺序在启动时核对，服务只从受控本地目录加载模型，不接受用户上传 joblib 或 pth。

vision 的 POST /predict 使用 multipart 图片。最多 5 MiB，只接收可解码 JPEG、PNG，尺寸限制 16 至 4096。处理 EXIF 方向后转换 RGB，CPU 工作在同步路由的线程池中执行，不阻塞 ASGI 事件循环。

每个进程最多同时处理两个推理请求，忙时返回 429。实际接收的请求体也受限制，不能只相信 Content-Length。生产 APP_ENV=production 必须设置独立 INFERENCE_TOKEN，由服务调用方通过 Bearer 提供，令牌不进入文章和日志。

响应包含 version、结果和置信信息。本版 0.8 只演示低置信度复核入口，softmax 不是“诊断正确概率”，高分也不能证明未知图片属于训练范围。真实放行阈值需要验证集、错误成本与人工复核预算；不能让这个示例直接自动执行农药处理等决策。

## 观测与回滚

```bash
env OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 .venv/bin/python scripts/check_models.py
```

检查加载真实产物，经 HTTP 完成预测、拒绝无效输入并核对重载结果，另外报告同一输入的五次耗时。五次小样本中位数只描述此机器和路径，不宣称生产 P99 或吞吐。

/metrics 提供推理时延与状态。monitor.py 读取同一特征合同，比较输入均值相对训练标准差的变化；有 actual 和 predicted 时才计算 MAE。输入变化不等于概念漂移，没取得标签时不能报告准确率下降。

版本目录一起保存模型、artifact.json、数据来源与评估条件。更新使用新目录和固定镜像，先核对合同与受控样本，再切换流量；回滚切回上一完整版本，预处理与权重一起恢复。重训练、发布与回滚记录分开，不覆盖原评估证据。

先按 Python Dockerfile 构建 jaslearning/python-api:0.1.0，再运行以下命令。构建器只复制当前版本的模型与元数据，不把原始图片、检查点和日志带进镜像：

```bash
.venv/bin/python scripts/model_image.py forecast .local/models/forecast-v1
.venv/bin/python scripts/model_image.py vision .local/models/vision-v1
```

生成标签分别为 0.1.0-forecast-v1 与 0.1.0-vision-v1，模型摘要进入镜像 label。标签已存在却对应不同模型时停止，必须创建新版本；不能覆盖同名标签后宣称回滚对象没有变化。


[系列目录](/notes/python-00-learning-guide) · [Kubernetes 配置](/notes/go-kubernetes-lab)
