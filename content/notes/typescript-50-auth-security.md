---
title: "TypeScript 50：认证与授权：保护任务属于谁这件事"
date: "2026-11-12"
excerpt: "随机任务编号、HttpOnly与CORS都配置了，为什么仍可能越权？沿身份、资源归属、浏览器凭据和跨站请求拆开这些措施的实际作用。"
tags: [ "TypeScript", "数据库与安全" ]
category: "typescript-11-database-security"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

拿到一条任务链接，不应因此拿到访问权。随机编号降低猜测机会，链接仍可能出现在历史、日志或分享中；后端必须按当前身份限制任务。安全判断落在请求实际能做什么，不以某个配置名称代替。

认证确认身份；授权决定该身份能访问什么。密码用维护良好的专用哈希库和 Argon2id 等密码哈希算法保存，不可明文或可逆加密。这里采用服务端会话和 HttpOnly Cookie，HTTPS 下再启用 Secure。

SameSite 可减少部分跨站请求风险；若跨站部署，需要同时规划 CORS、Cookie 属性和 CSRF 防护。输出到 HTML 的不可信文本要正确转义，数据库输入用参数化查询。

每个资源查询都绑定当前用户，避免 IDOR 越权。生产会话必须使用持久化会话存储，不能使用 Express 默认的内存存储；设置空闲和绝对过期时间，登录成功后更新会话标识，退出时销毁会话。

认证中间件从受控会话恢复userId，不读客户端body中的ownerId；列表、详情、更新与删除各自把身份条件送进实际查询。只在列表过滤，单项接口仍按id直查，就是留下另一条越权入口。

会话标识进入HttpOnly Cookie，服务端存会话状态，浏览器只按策略携带。登录更新标识减少固定会话风险，退出销毁服务端状态；用户被禁用后何时失效、密钥轮换怎样影响旧会话，都要按业务要求确定。

Cookie 认证的变更请求应验证 Origin；按部署形态使用 SameSite 和 CSRF Token。对登录、注册和密码重试添加速率限制，并设置安全响应头。密钥通过环境变量或密钥管理服务提供。

限制 JSON body 大小，并对公开 API 设置合理的请求频率和超时。生产数据库端口只暴露给应用网络。Cookie 会话库需要随机且足够长的签名密钥，轮换时考虑旧会话如何失效。

HttpOnly阻止脚本直接读取Cookie，却不阻止已在同源执行的恶意脚本发请求；XSS防护仍需要安全文本输出与受控HTML。CORS主要约束浏览器跨源读取行为，不能拦住直接HTTP客户端，也不证明当前用户拥有资源。

CSRF利用浏览器自动携带凭据，SameSite、Origin与Token按具体同源或跨站拓扑组合。对可信代理的设置也要限定来源，否则攻击者可伪造转发头影响协议或IP判断。只有和真实部署路径一起检查，Cookie属性才有完整含义。

## 每项安全措施都有自己的覆盖范围

- 随机 UUID 不等于授权。
- HttpOnly 降低脚本读取 Cookie 的风险，但不能阻止所有 CSRF。
- CORS 不是认证或授权机制。
- SameSite、Origin 检查和 CSRF Token 应按请求拓扑组合使用，不能把其中一项当成完整防护。
- 不要记录密码、会话 Cookie 或完整 Authorization 头。

测试用两个独立会话，A读取、修改、删除B的任务都失败，数据库内容不变；再检查过期会话与退出后的请求被拒绝。通过接口行为验证覆盖范围，比只检查配置文件出现几个安全选项更可靠。

## 动手验证

构造一个用户 A 请求用户 B 任务的测试场景；说明 API 如何拒绝，并列出需要保护的 Cookie 属性。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：迁移、种子数据与事务：让数据变更能重现](/notes/typescript-49-migrations-transactions) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：npm workspaces：组织前端、API 和共享包](/notes/typescript-51-workspaces)

