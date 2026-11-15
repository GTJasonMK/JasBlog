# 友链

友链地址为 `/collections/friends`，入口由站点导航中的 `collection:friends` 提供。数据保存在 `content/friends.json`，编辑器的“站点 → 友链”逐条维护名称、网址、介绍、头像、顺序和 `draft/published` 状态。发布状态只影响这一条友链，顺序数字越小越靠前。

空名单会显示“暂无友链”。添加站点后将状态设为公开并保存，再按正常发布流程构建站点。头像可以使用 `/media/`、`/photography/`、`/backgrounds/` 下的本地素材或不含凭据的 HTTPS 地址。

`content/pages/friends.md` 保留为草稿，防止旧 Markdown 页面和结构化友链重复出现。不要通过这份文件维护友链名单；如果需要写友链说明，可以另建独立页面。

栏目模板和地址由博客项目维护，编辑器只修改栏目数据和友链数据，不承担卡片布局或样式。
