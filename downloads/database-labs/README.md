# PostgreSQL 16 本机实验

这里包含两份 Compose 配置和七份 SQL 脚本。数据均为虚构订单，邮箱使用保留的 .invalid 域名。完整讲解见[实验手册](https://blog.imggb.top/notes/database-lab-guide)，已有结果与限制见[实验记录](https://blog.imggb.top/notes/database-lab-results)。

## 启动

需要 Docker Engine、Docker Compose 和 Bash。建议至少准备 2 核 CPU、4 GB 可用内存与 4 GB 可用磁盘。解压资源包后，在它的父目录中逐条运行：

```bash
cd database-labs
read -rsp '输入实验数据库密码: ' LAB_DB_PASSWORD
printf '\n'
export LAB_DB_PASSWORD
docker compose up -d --wait
docker compose exec db psql -X -U lab_admin -d db_lab
```

连接使用本机 127.0.0.1:55432，数据库为 db_lab，管理员为 lab_admin。这个身份是实验超级用户。配置没有生产 TLS 与远程网络设置。

在 psql 中检查目标，再退出：

```sql
SELECT version(), current_database(), current_user;
SELECT id, sku, stock FROM shop.products ORDER BY id;
\q
```

## 自检与下单函数

在 database-labs 目录逐条运行，每条成功后再继续：

```bash
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/02-checks.sql
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/03-place-order.sql
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U lab_admin -d db_lab < sql/04-order-checks.sql
```

00-schema.sql 和 01-seed.sql 只在空数据目录首次启动时自动执行。03-place-order.sql 安装一次即可；04-order-checks.sql 回滚业务写入，可以重复运行，序列编号可能留空洞。其余实验按在线手册的前置条件分别执行，不能把全部 SQL 一次性重跑到已有成果上。

## 保存成果

输出与备份保存在本地 .local 目录，不把密码、备份和敏感日志放进公开仓库。stop 保留容器和数据；down 保留命名数据卷。down -v 会删除数据，不能用作日常重启。

启动过恢复容器后，用两份配置一起管理环境，例如 docker compose -f compose.yaml -f compose.recovery.yaml stop。PITR 必须完成归档、基础备份和恢复点步骤后再启动恢复容器，不能只启动 compose.recovery.yaml 就当作恢复完成。

新终端需要重新设置 LAB_DB_PASSWORD。这个环境变量不会修改已有数据库的密码。postgres:16 标签会更新补丁版本，运行后记录自己的实际版本和镜像摘要；该资源包不包含已经运行的数据库或备份。
