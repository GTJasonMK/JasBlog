---
title: "Python 41：FastAPI：一次请求如何经过校验和业务处理"
date: "2026-11-12"
excerpt: "理解一个 API 时，我会沿着请求往下看：输入在哪里解析，业务规则在哪里执行，结果又怎样变成 HTTP 响应。FastAPI 能处理其中一部分工作，权限和数据一致性仍然需要自己设计。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

理解一个 API 时，我会沿着请求往下看：输入在哪里解析，业务规则在哪里执行，结果又怎样变成 HTTP 响应。FastAPI 能处理其中一部分工作，权限和数据一致性仍然需要自己设计。

后端服务接收 HTTP 请求、校验输入、调用业务逻辑和数据存储，再返回状态码与 JSON。REST API 常用资源路径表达对象，用 HTTP 方法表达读取、创建、更新和删除。

FastAPI 利用类型标注和 Pydantic 模型校验请求，并生成 OpenAPI 文档。基础示例：

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Greeting(BaseModel):
    name: str = Field(min_length=1, max_length=80)


@app.post("/greet")
def greet(body: Greeting) -> dict[str, str]:
    return {"message": f"你好，{body.name}"}
```

安装 `fastapi` 与 `uvicorn` 后运行 `uvicorn app:app --reload`，再打开 `/docs` 查看交互式接口文档。`GET` 用于读取，`POST` 创建，`PATCH` 局部更新，`DELETE` 删除。错误应使用清楚的 HTTP 状态码和响应体。

## HTTP 与关系数据库基础

请求通常由路径、查询参数、请求头和请求体组成；响应包含状态码、响应头和内容。身份认证回答“你是谁”，授权回答“你能做什么”，两者都不能只靠 Pydantic 的字段校验替代。

关系数据库用表保存记录：主键唯一标识一行，外键连接另一张表。常见 SQL 读法：

```sql
SELECT tasks.id, tasks.title, users.name
FROM tasks
JOIN users ON tasks.owner_id = users.id
WHERE tasks.done = ?;
```

占位符语法因数据库驱动而异；始终使用参数化查询。事务把多步写入作为一个整体提交或回滚；ORM 隐藏一部分 SQL，但不会消除索引、连接、事务隔离和查询效率等概念。

## 服务安全与框架选择

密码应使用专门的密码哈希算法保存，不能明文或用普通哈希代替。密钥从环境变量或密钥管理服务读取；接口要分别检查身份和资源权限。FastAPI 适合 API 路线，Django 自带更完整的 Web 与管理能力，Flask 更轻量。

## 输入模型不能代替权限与并发设计

类型标注以外还要校验边界和权限。同步数据库驱动应配普通 `def` 路由；只有调用异步 I/O 时，`async def` 才能发挥并发作用。

## 动手验证

**练习：**为什么创建资源常返回 `201`，而非 `200`？

**答案：**`201 Created` 更准确地表达请求创建了新资源，也便于客户端理解结果。

---

[上一篇：用 PyTorch 训练一个手写数字分类器](/notes/python-40-dl-project) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：用 FastAPI 和 SQLite 做一个任务 API](/notes/python-42-backend-project)

