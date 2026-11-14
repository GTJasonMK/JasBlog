---
title: "TypeScript 54：注册、登录、刷新与退出的完整流程"
date: "2026-11-12"
excerpt: "登录接口成功了，刷新为什么又变匿名？沿密码验证、会话保存、Cookie发送和me恢复检查完整链路，再确认退出真正销毁服务端身份。"
tags: [ "TypeScript", "全栈整合与发布" ]
category: "typescript-12-delivery"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

登录响应200，只证明这一请求返回成功。若会话没保存、Cookie属性不匹配或代理没有转发，刷新后的me仍会匿名。把成功响应、浏览器持有凭据与服务器恢复身份分开验证，才能知道故障在哪一段。

注册时校验邮箱与密码，使用 Argon2id 等密码哈希算法保存结果。邮箱唯一性由数据库 UNIQUE 约束保护；提前查询可以改善提示，但仍要处理并发写入产生的唯一键冲突。登录时比较密码哈希，登录成功后更新会话标识并写入 HttpOnly Cookie。当前用户接口从会话恢复身份；退出时销毁服务端会话并清 Cookie。

开发阶段可使用内存会话存储；这组笔记生产默认使用 PostgreSQL 持久化会话存储，Redis 可作为扩展方案。设置会话签名密钥、空闲与绝对过期时间。不要使用 express-session 默认的 MemoryStore 部署生产环境。

会话 Cookie 至少设置 HttpOnly、Path=/ 和 SameSite=Lax；生产 HTTPS 设置 Secure。若确需跨站 Cookie，使用 SameSite=None; Secure 并配合 CSRF Token 与严格 Origin 校验。响应中只返回公开用户字段，不返回 passwordHash。

同源 Vite 代理下，浏览器请求 /api 即可使用同源 Cookie。对写入请求检查 Origin；跨站部署时还需精确配置允许来源、credentials、SameSite 与 CSRF Token，不能用任意来源搭配凭证。

用户界面要处理加载、无会话、登录失败、过期和退出中的状态。

注册与登录中的密码哈希属于昂贵操作，输入长度与频率应有合理边界；查到用户后使用成熟库验证，不自行比较普通哈希字符串。登录失败采用稳定提示，服务端保留受控诊断，避免向请求方暴露账号存在性。

会话创建后确认存储完成再交付需要的结果，登录更新会话身份，me只返回公开用户字段。应用多副本使用共同持久化存储，否则某个实例建立的会话，下一次换实例就可能失效；前端重试无法修好这个共享状态问题。

## 在浏览器实际核对凭据路径

观察Set-Cookie是否被接受，后续同源请求是否携带，域、Path、SameSite与Secure是否符合访问方式。HTTPS代理后也要按可信代理配置识别协议；不要为临时通过就取消Secure或允许任意来源凭据。

退出先销毁服务端会话并清理对应Cookie，页面再清理身份缓存。删Cookie只能让当前浏览器不再提供凭据，不等于服务器撤销了已复制的会话；关闭浏览器也可能被会话恢复功能保留，不能把关窗口当可靠退出机制。

## 凭证只留在合适的边界内

- 注册时不能保存明文密码。
- 登录失败消息避免暴露邮箱是否存在等不必要信息。
- Cookie 会话不应由前端 JavaScript 读取。

## 动手验证

按注册、登录、刷新页面、退出顺序测试；显式删除Cookie后检查me未登录，再用已退出会话的原凭据请求，确认服务端也已拒绝。过期时间用受控测试时钟或短期隔离配置验证，不靠等待真实生产会话碰巧过期。

[这一节的练习参考](/notes/typescript-exercise-answers)。

---

[上一篇：任务 API：把会话、校验和持久化连起来](/notes/typescript-53-task-api) · [TypeScript 目录](/notes/typescript-00-learning-guide) · [下一篇：单元和组件测试：把用户能观察到的行为写下来](/notes/typescript-55-unit-component-tests)

