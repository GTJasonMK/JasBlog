---
title: "Python 42：用 FastAPI 和 SQLite 做一个任务 API"
date: "2026-11-12"
excerpt: "这里先把任务的增删改查完整连起来，再补数据库初始化和测试。SQLite 让本地例子容易运行；迁移、部署和真实用户的访问控制则需要另外讲清楚，不能从这个演示直接推断。"
tags: [ "Python", "应用与项目" ]
category: "python-part5"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

这里先把任务的增删改查完整连起来，再补数据库初始化和测试。SQLite 让本地例子容易运行；迁移、部署和真实用户的访问控制则需要另外讲清楚，不能从这个演示直接推断。

数据层采用 SQLModel，它基于 SQLAlchemy 与 Pydantic；路由和 SQLite 驱动都使用同步调用，避免把阻塞数据库操作直接放进异步事件循环。

安装依赖：`python -m pip install fastapi uvicorn sqlmodel pytest httpx`。

把下面保存为 `app.py`：

```python
import os

from fastapi import Depends, FastAPI, HTTPException, Response
from sqlmodel import Field, Session, SQLModel, create_engine, select

database_url = os.environ.get("DATABASE_URL", "sqlite:///tasks.db")
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=120)
    done: bool = False


class Task(TaskBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    done: bool | None = None


def get_session():
    with Session(engine) as session:
        yield session


app = FastAPI()


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(data: TaskCreate, session: Session = Depends(get_session)):
    task = Task(title=data.title, done=data.done)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@app.get("/tasks", response_model=list[Task])
def list_tasks(session: Session = Depends(get_session)):
    return session.exec(select(Task).order_by(Task.id)).all()


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int, data: TaskUpdate, session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="任务不存在")
    changes = data.model_dump(exclude_unset=True)
    if not changes or any(value is None for value in changes.values()):
        raise HTTPException(status_code=422, detail="至少提供一个非空更新字段")
    for key, value in changes.items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="任务不存在")
    session.delete(task)
    session.commit()
    return Response(status_code=204)
```

首次本地运行前，创建 `init_db.py`：

```python
from sqlmodel import SQLModel
from app import engine

SQLModel.metadata.create_all(engine)
```

执行 `python init_db.py` 后，再运行 `uvicorn app:app --reload`，用 `/docs` 创建任务并验证 CRUD。`--reload` 只用于开发；生产项目通过 Alembic 迁移建表，不在服务启动时自动修改数据库结构。

## 部署与交付

1. **管理配置：**默认 SQLite URL 可用于本地学习。部署 PostgreSQL 时，通过 `DATABASE_URL` 设置连接串，并安装对应数据库驱动；不要把连接密码提交到仓库。
2. **管理迁移：**安装 Alembic 后运行 `alembic init migrations`；在 `migrations/env.py` 里导入 `SQLModel` 和任务模型，把 `target_metadata` 指向 `SQLModel.metadata`，并从 `DATABASE_URL` 设置 Alembic 的连接地址；运行 `alembic revision --autogenerate -m "create tasks"`，检查生成的 SQL 后再运行 `alembic upgrade head`。不要在生产启动时自动调用 `create_all`。
3. **锁定依赖：**依赖至少包括 FastAPI、Uvicorn、SQLModel、Alembic 和目标数据库驱动；在已验证环境中记录 Python 与依赖版本，再生成部署使用的锁文件或带精确版本的依赖清单。
4. **构建容器：**把下列内容保存为 `Dockerfile`，并提供锁定后的 `requirements.txt`：

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY alembic.ini .
COPY migrations ./migrations
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

5. **运行服务：**容器或服务器使用不带 `--reload` 的 ASGI 服务；生产环境还需 TLS 反向代理、健康检查、日志、数据库备份及访问控制。认证应使用成熟的框架方案，并对每个资源检查授权。

## 测试思路

在项目根目录创建 `test_app.py`，用临时 SQLite 文件隔离测试数据：

```python
import app as task_app
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine


def test_task_crud(tmp_path, monkeypatch):
    test_engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    monkeypatch.setattr(task_app, "engine", test_engine)
    try:
        SQLModel.metadata.create_all(test_engine)
        with TestClient(task_app.app) as client:
            created = client.post("/tasks", json={"title": "学习 Python"})
            assert created.status_code == 201
            task_id = created.json()["id"]

            updated = client.patch(f"/tasks/{task_id}", json={"done": True})
            assert updated.json()["done"] is True
            assert client.get("/tasks").json()[0]["title"] == "学习 Python"
            assert client.delete(f"/tasks/{task_id}").status_code == 204
            assert client.patch("/tasks/999", json={"done": True}).status_code == 404
            assert client.post("/tasks", json={"title": ""}).status_code == 422
    finally:
        test_engine.dispose()
```

运行 `python -m pytest`。测试覆盖成功路径、更新、删除、缺失资源和输入校验，且不会污染开发数据库。

## 动手验证

**练习：**增加 `GET /tasks/{task_id}`，找不到任务时返回 `404`。

```python
@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task
```

## 本地演示和真实用户服务的边界

不要把开发数据库或密钥提交到仓库。删除和更新前确认资源存在；真实用户数据需要身份认证和授权，不能只依赖输入模型校验。

---

[上一篇：FastAPI：一次请求如何经过校验和业务处理](/notes/python-41-backend) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：采集、办公、GUI 与科学计算：Python 的几条延伸方向](/notes/python-43-other-domains)

