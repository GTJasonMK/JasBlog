# 博客模块边界

博客持有 Next 路由、metadata、静态导出、站点导航、评论与 Node 文件读取。图谱和内容合同来自 `@jas/graph-core`、`@jas/content-core`，详情及列表展示来自 `@jas/content-ui`、`@jas/graph-ui`。

ContentHost 注入 Next Link、Image、内容路径和标签路径。公共展示不知道博客路由，也不读取工作区文件。正文与图谱 CSS 由显式包导出加载，不再复制编辑器预览样式。

导入图谱保留完整 meta 和语义字段，并拒绝覆盖已存在的创作文件。无效正文图谱展示错误并保留代码原文；图谱文档使用第一块作为主图，不跳过错误块。

公共实现、升级和迁移方式见 [JasShared 架构说明](https://github.com/GTJasonMK/JasShared/blob/main/docs/architecture.md)。依赖固定 Release URL 与 lockfile。应用可单独检出后使用 npm ci、npm test、npm run lint 和 npm run build 验证，无须检出编辑器或公共源码。
