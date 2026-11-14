---
title: "数据库 01：先确认连的是谁、操作的是哪个库"
date: "2026-11-13"
excerpt: "刚开始接触数据库时，我会先把服务端、客户端和数据文件分开看。知道 SQL 发给了谁、自己用什么身份操作，再去讨论建表和改数据，才不会把连接成功当成环境已经准备好。"
tags: [ "数据库", "PostgreSQL" ]
category: "database-sql"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-13
---

刚开始接触数据库时，我会先把服务端、客户端和数据文件分开看。知道 SQL 发给了谁、自己用什么身份操作，再去讨论建表和改数据，才不会把连接成功当成环境已经准备好。

## 数据库解决什么问题

文件可以保存数据，但多人同时修改时还需要决定谁先写、失败写入是否撤销、数据是否满足规则、断电后如何恢复。数据库管理系统把这些能力集中起来。应用通过连接发送语句，服务端验证权限、执行查询并维护持久化状态。

关系数据库以表、行、列组织数据，用键表示身份，用约束维护关系。SQL 是操作语言，PostgreSQL、MySQL 是具体实现。Redis、MongoDB、ClickHouse 解决的主要工作负载不同，选型要从事务、访问模式和运维条件出发。

`psql` 与图形客户端只是发送命令的工具。关闭客户端不会删除数据库；删除容器与删除持久化数据卷也不是同一件事。

## 认识对象层次

在 PostgreSQL 中，一个运行实例管理一个数据库集簇，集簇包含多个数据库，数据库内有 schema，schema 下有表、视图、索引、函数等对象。这里的“集簇”不表示已经部署多台高可用服务器。

例如 `db_lab` 是数据库，`shop` 是 schema，`shop.orders` 是完整表名。不同数据库通常需要分别连接；不同 schema 可以在同一数据库中关联查询。MySQL 的 database 与 schema 基本同义，不能照搬这套层次。

## 完成第一次操作

按[实验手册](/notes/database-lab-guide)启动环境。连接后先运行：

```sql
SELECT current_database(), current_user,
       inet_server_addr(), inet_server_port();
SHOW server_version;
SHOW transaction_isolation;
SHOW search_path;
SELECT id, sku, name, stock FROM shop.products ORDER BY id;
```

使用本地 Unix socket 时服务地址可能是 `NULL`，这不表示查询失败。图形客户端的连接名称可以随意起，SQL 返回的数据库和用户更可信。

`psql` 中 SQL 以分号结束。`\dt shop.*` 显示表，`\d shop.orders` 显示结构，`\conninfo` 显示连接信息，`\q` 退出。提示符出现 `!` 通常表示当前事务已失败，需要回滚后继续。

执行 SQL 文件时使用 `-v ON_ERROR_STOP=1`，使第一处错误直接终止执行。普通终端的一次报错后继续执行，可能让你误以为完整脚本已经成功。

## 建立操作习惯

查询前核对环境，修改前核对对象和条件，执行后核对影响行数与业务结果。先用事务练习修改，再决定提交或回滚。教学数据库用管理员，是为了学习管理命令；业务应用使用独立权限角色。

这组笔记种子中有 3 位客户、3 个商品、3 个订单。商品库存依次为 97、49、0。两笔已支付订单总额为 59700 分。保存这些基线，后续用来发现误修改。

## 动手验证

1. 不看客户端标题，用 SQL 报告数据库、用户、版本和隔离级别。
2. 解释容器停止后数据为什么仍在，并找到对应数据卷。
3. 执行基线自检，保存输出。停止再启动服务，确认同样通过。

官方对象定义见[术语与系统目录](https://www.postgresql.org/docs/16/ddl-schemas.html)。

---

[数据库目录](/notes/database-00-learning-guide) · [下一篇：一条 SQL 从执行到落盘经历了什么](/notes/database-02-storage-execution)
