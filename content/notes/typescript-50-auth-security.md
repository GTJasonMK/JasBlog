---
title: "TypeScript 50：认证与授权：保护任务属于谁这件事"
date: "2026-11-12"
excerpt: "资源 id 即使很难猜，也不能代替权限检查。我会把任务 id 和当前用户 id 一起限定在查询中，再分别处理密码、会话、Cookie 和跨站请求的风险。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

资源 id 即使很难猜，也不能代替权限检查。我会把任务 id 和当前用户 id 一起限定在查询中，再分别处理密码、会话、Cookie 和跨站请求的风险。

认证确认身份；授权决定该身份能访问什么。密码用维护良好的专用哈希库和 Argon2id 等密码哈希算法保存，不可明文或可逆加密。这里采用服务端会话和 HttpOnly Cookie，HTTPS 下再启用 Secure。

SameSite 可减少部分跨站请求风险；若跨站部署，需要同时规划 CORS、Cookie 属性和 CSRF 防护。输出到 HTML 的不可信文本要正确转义，数据库输入用参数化查询。

每个资源查询都绑定当前用户，避免 IDOR 越权。生产会话必须使用持久化会话存储，不能使用 Express 默认的内存存储；设置空闲和绝对过期时间，登录成功后更新会话标识，退出时销毁会话。

Cookie 认证的变更请求应验证 Origin；按部署形态使用 SameSite 和 CSRF Token。对登录、注册和密码重试添加速率限制，并设置安全响应头。密钥通过环境变量或密钥管理服务提供。

限制 JSON body 大小，并对公开 API 设置合理的请求频率和超时。生产数据库端口只暴露给应用网络。Cookie 会话库需要随机且足够长的签名密钥，轮换时考虑旧会话如何失效。

## 每项安全措施都有自己的覆盖范围

- 随机 UUID 不等于授权。
- HttpOnly 降低脚本读取 Cookie 的风险，但不能阻止所有 CSRF。
- CORS 不是认证或授权机制。
- SameSite、Origin 检查和 CSRF Token 应按请求拓扑组合使用，不能把其中一项当成完整防护。
- 不要记录密码、会话 Cookie 或完整 Authorization 头。

## 动手验证

构造一个用户 A 请求用户 B 任务的测试场景；说明 API 如何拒绝，并列出需要保护的 Cookie 属性。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：迁移、种子数据与事务：让数据变更能重现](/notes/typescript-49-migrations-transactions) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：npm workspaces：组织前端、API 和共享包](/notes/typescript-51-workspaces)

