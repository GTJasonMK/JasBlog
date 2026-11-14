---
title: "Go 44：CI/CD：让每次发布有可追溯的结果"
date: "2026-11-12"
excerpt: "一条流水线对我有用，前提是失败会停下来，成功产物可以追溯。源码版本、镜像 digest、迁移版本和部署记录应该能对应起来，而不是只留下一个“发布成功”。"
tags: [ "Go", "部署与运维" ]
category: "go-part6"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

一条流水线对我有用，前提是失败会停下来，成功产物可以追溯。源码版本、镜像 digest、迁移版本和部署记录应该能对应起来，而不是只留下一个“发布成功”。

## CI 流水线

典型流水线先运行 gofmt 检查、go vet、单元测试和竞态检测，再构建镜像、扫描依赖与镜像，最后推送不可变 artifact。需要真实数据库和 Redis 的集成测试应在隔离服务中运行。

## CD 发布

部署配置按环境管理。先部署到测试环境并执行 smoke test，再通过渐进发布或滚动发布进入生产。每次发布保留代码版本、镜像 digest、数据库迁移版本和部署记录。

## 凭据与供应链

CI 凭据按最小权限和短时有效原则管理；依赖版本和构建基础镜像应可追溯。不要在 workflow 输出中打印 secret，也不要使用浮动的 latest 标签作为生产制品。

## 动手验证

画出从提交到 Kubernetes 部署的流水线，标出任一检查失败时停止发布的位置和可回滚的制品。

---

[上一篇：日志、指标与 Trace：从异常找到调用链](/notes/go-43-observability) · [Go 目录](/notes/go-00-learning-guide) · [下一篇：生产排障：先确认影响，再定位原因](/notes/go-45-operations)

