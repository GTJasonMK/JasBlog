---
title: "TypeScript 46：关系数据库与 SQL：从持久化到关联查询"
date: "2026-11-12"
excerpt: "把任务从内存移到数据库之后，我会先明确每条查询影响哪些行。WHERE、JOIN 和绑定参数直接决定了数据范围，ORM 也不能替我们省掉对它们的理解。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

把任务从内存移到数据库之后，我会先明确每条查询影响哪些行。WHERE、JOIN 和绑定参数直接决定了数据范围，ORM 也不能替我们省掉对它们的理解。

关系型数据库把数据存入表。行表示记录，列表示字段。SQL 的 SELECT 查询、INSERT 新增、UPDATE 修改、DELETE 删除。WHERE 限定影响范围；参数化查询把输入作为值传递，避免拼接 SQL。

~~~sql
SELECT id, title, status
FROM tasks
WHERE owner_id = $1
ORDER BY created_at DESC
LIMIT $2;
~~~

JOIN 用关联键把多张表的数据合并；GROUP BY 配合聚合函数可统计分组结果：

~~~sql
SELECT users.email, COUNT(tasks.id) AS task_count
FROM users
LEFT JOIN tasks ON tasks.owner_id = users.id
GROUP BY users.id, users.email;
~~~

LEFT JOIN 保留没有任务的用户；COUNT(tasks.id) 对这类用户返回 0。还应认识 INNER JOIN、COUNT、SUM、AVG 和 HAVING 的用途。

任务数据放在进程内存中，服务重启后会消失；数据库提供持久存储和并发访问能力。

## 读写范围和返回字段都要限制

- UPDATE 或 DELETE 忘写 WHERE 可能修改整张表。
- 不拼接用户输入生成 SQL。
- 查询只取业务需要的列，避免无意返回 passwordHash 等敏感字段。
- 关联查询要在数据库中明确 JOIN 条件，避免在应用里逐行重复查询造成 N+1。

## 动手验证

写出查询某用户未完成任务、按创建时间倒序并限制 20 条的 SQL。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：日志与环境配置：启动就把问题暴露出来](/notes/typescript-45-logging-config) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：用户与任务的数据关系怎么设计](/notes/typescript-47-data-modeling)

