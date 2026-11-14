---
title: "TypeScript 46：关系数据库与 SQL：从持久化到关联查询"
date: "2026-11-12"
excerpt: "没有任务的用户统计成1，COUNT哪里算错了？从行粒度、左连接和空值解释查询，再用当前用户条件与参数绑定限制真实数据范围。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

用户表左连接任务，没任务的用户也保留一行。如果直接COUNT(*)，这行仍被计为1，结果就像他拥有一项任务。SQL算的是查询产生的行，要先知道每行代表什么，再选聚合表达式。

关系型数据库把数据存入表。行表示记录，列表示字段。SQL 的 SELECT 查询、INSERT 新增、UPDATE 修改、DELETE 删除。WHERE 限定影响范围；参数化查询把输入作为值传递，避免拼接 SQL。

~~~sql
SELECT id, title, status
FROM tasks
WHERE owner_id = $1
ORDER BY created_at DESC, id DESC
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

COUNT(*)数结果行，COUNT某字段忽略该字段为NULL的行。左连接没有匹配任务时，tasks.id为NULL，所以这里得到0。若还连接多条标签，一项任务可能扩成多行，统计前还要处理关联基数，不能看到重复就随意加DISTINCT。

WHERE在分组前过滤输入行，HAVING在分组后按聚合结果筛选。需要保留没有任务的用户时，任务条件放在ON与放在WHERE可能改变结果；WHERE排除右侧NULL行后，原本保留的用户也会消失。

任务数据放在进程内存中，服务重启后会消失；数据库提供持久存储和并发访问能力。

第一条查询按当前身份的owner_id限制，limit必须是经过范围检查的整数。`$1`、`$2`是PostgreSQL驱动常见占位形式，值单独绑定；排序列名等结构不能作为普通值占位，确需动态选择时使用白名单。

时间相同再按id排序，让分页次序稳定；索引也按常用过滤与排序评估。一次查询取需要的字段，避免循环中每个任务再查一次用户，形成大量网络往返。

## 读写范围和返回字段都要限制

- UPDATE 或 DELETE 忘写 WHERE 可能修改整张表。
- 不拼接用户输入生成 SQL。
- 查询只取业务需要的列，避免无意返回 passwordHash 等敏感字段。
- 关联查询要在数据库中明确 JOIN 条件，避免在应用里逐行重复查询造成 N+1。

更新和删除同样带当前用户与目标编号条件，并检查实际影响行数。先在独立SELECT中确认范围、再执行无条件UPDATE，既可能写错范围，也不能防止中间并发变化。数据安全规则应进入实际写入语句。

## 动手验证

写出查询某用户未完成任务、按创建时间倒序并限制 20 条的 SQL。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：日志与环境配置：启动就把问题暴露出来](/notes/typescript-45-logging-config) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：用户与任务的数据关系怎么设计](/notes/typescript-47-data-modeling)

