# Verbal Memory 生产部署

## 1. 生产架构

```text
Frontend: https://verbal.pmsjl.com
    -> Cloudflare Pages

API: https://verbal-api.pmsjl.com
    -> Cloudflare Tunnel (remotely-managed)
    -> ECS 127.0.0.1:8080
    -> verbal-backend:8080
    -> Docker bridge network: verbal-net
    -> mysql:3306
    -> Docker named volume: verbal_mysql_data
```

Spring Boot 后端与 MySQL 通过 Docker Compose 部署在阿里云 ECS。MySQL 不暴露宿主机端口，后端通过 Compose service name `mysql` 访问数据库；数据持久化在 named volume `verbal_mysql_data`。当前生产请求链路不依赖 Nginx 或 Certbot。

Cloudflare Tunnel 使用 remotely-managed 模式，hostname 与 service 的映射保存在 Cloudflare 控制台，不在本仓库保存 token 或本地 `config.yml`。

## 2. 配置

```bash
cp .env.example .env
cp mysql.env.example mysql.env
```

修改两个文件中的生产密码。`.env`、`mysql.env`、数据库备份和 Tunnel token 禁止提交到 Git。

## 3. 构建与启动

```bash
docker compose build backend
docker compose up -d
docker compose ps
docker compose logs --tail=100 backend
```

首次部署或空数据库初始化时，执行：

```bash
docker exec -i verbal-mysql \
  sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < backend/sql/init.sql
```

如果迁移已有生产数据，应使用受保护的备份文件导入，而不是把备份放进仓库。

## 4. Cloudflare Tunnel

ECS 上运行 `cloudflared` 服务：

```bash
systemctl status cloudflared
```

Cloudflare Public Hostname 应将 `verbal-api.pmsjl.com` 转发到：

```text
HTTP http://localhost:8080
```

## 5. 验证

```bash
curl http://127.0.0.1:8080/api/records
curl https://verbal-api.pmsjl.com/api/records
curl -OJ https://verbal-api.pmsjl.com/api/records/export
```

前端访问 `https://verbal.pmsjl.com`，管理页为 `?admin=1`。当前管理页仍没有鉴权，不应将该入口当作公开管理系统。

## 6. 更新与数据安全

```bash
git pull
docker compose build backend
docker compose up -d --force-recreate backend
docker compose logs --tail=150 backend
```

`docker compose down` 不会默认删除 named volume。生产环境不要随意执行：

```bash
docker compose down -v
```

该命令会删除 Compose 管理的数据库 Volume。
