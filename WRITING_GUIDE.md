# JasBlog 博客写作指南

本指南帮助你快速上手博客内容创作。

---

## 目录结构

```
content/
├── notes/          # 学习笔记 (Markdown)
├── projects/       # 开源项目 (Markdown)
├── roadmaps/       # 规划文档 (Markdown)
└── graphs/         # 知识图谱 (JSON)
```

---

## 一、学习笔记 (Notes)

### 文件位置
`content/notes/` 目录下创建 `.md` 文件

### 文件命名
使用英文小写 + 短横线，如 `react-hooks.md`、`typescript-basics.md`

### 基本模板

```markdown
---
title: 文章标题
date: 2026-02-03
excerpt: 文章摘要，会显示在列表页
tags:
  - 标签1
  - 标签2
---

正文内容从这里开始...
```

### Frontmatter 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，格式 `YYYY-MM-DD` |
| `excerpt` | 是 | 摘要，显示在文章列表 |
| `tags` | 否 | 标签数组，用于分类筛选 |

---

## 二、Markdown 语法大全

### 1. 标题

```markdown
# 一级标题 (页面标题，一般不用)
## 二级标题 (章节标题)
### 三级标题 (小节标题)
#### 四级标题
##### 五级标题
###### 六级标题
```

效果：标题会自动生成目录锚点

---

### 2. 段落与换行

```markdown
这是第一段。

这是第二段。(空一行表示新段落)

这是强制换行
末尾加两个空格

或者使用 <br> 标签换行
```

---

### 3. 文字样式

```markdown
**粗体文字**
*斜体文字*
***粗斜体***
~~删除线~~
`行内代码`
```

效果：
- **粗体文字**
- *斜体文字*
- ***粗斜体***
- ~~删除线~~
- `行内代码`

---

### 4. 列表

**无序列表：**
```markdown
- 项目一
- 项目二
  - 子项目 (缩进两个空格)
  - 子项目
- 项目三
```

**有序列表：**
```markdown
1. 第一步
2. 第二步
3. 第三步
```

**任务列表：**
```markdown
- [x] 已完成
- [ ] 未完成
```

---

### 5. 链接与图片

**链接：**
```markdown
[链接文字](https://example.com)
[带标题的链接](https://example.com "鼠标悬停显示")
```

**图片：**
```markdown
![图片描述](图片URL)
![本地图片](/images/example.png)
```

---

### 6. 引用

```markdown
> 这是引用文字
> 可以多行
>
> > 嵌套引用
```

效果：
> 这是引用文字
> 可以多行
>
> > 嵌套引用

---

### 7. 代码块

**行内代码：**
```markdown
使用 `console.log()` 输出
```

**代码块（指定语言高亮）：**

````markdown
```javascript
function hello() {
  console.log("Hello World");
}
```
````

**常用语言标识：**
- `javascript` / `js`
- `typescript` / `ts`
- `python`
- `java`
- `html`
- `css`
- `bash` / `shell`
- `json`
- `markdown`

---

### 8. 表格

```markdown
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  | 内容2    | 内容3  |
| 内容4  | 内容5    | 内容6  |
```

效果：

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  | 内容2    | 内容3  |
| 内容4  | 内容5    | 内容6  |

---

### 9. 分隔线

```markdown
---
***
___
```

三种写法效果相同，产生一条水平线。

---

### 10. 转义字符

如果要显示 Markdown 特殊字符本身，使用反斜杠转义：

```markdown
\*这不是斜体\*
\# 这不是标题
\[这不是链接\]
```

---

## 三、知识图谱嵌入

在文章中嵌入知识图谱，使用特殊代码块：

````markdown
```graph
{
  "nodes": [
    {
      "id": "node1",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "节点名称",
        "color": "blue",
        "tags": ["标签1", "标签2"],
        "content": "节点详细描述"
      }
    },
    {
      "id": "node2",
      "position": { "x": 200, "y": 100 },
      "data": {
        "label": "另一个节点",
        "color": "green"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "node1",
      "target": "node2",
      "label": "关系说明"
    }
  ]
}
```
````

### 节点属性

| 属性 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识 |
| `position.x` | 是 | X 坐标 |
| `position.y` | 是 | Y 坐标 |
| `data.label` | 是 | 节点标题 |
| `data.color` | 否 | 颜色：`red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `default` |
| `data.tags` | 否 | 标签数组 |
| `data.content` | 否 | 详细内容（点击节点显示） |

### 边属性

| 属性 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识 |
| `source` | 是 | 起始节点 ID |
| `target` | 是 | 目标节点 ID |
| `label` | 否 | 边上的文字说明 |

---

## 四、开源项目 (Projects)

### 文件位置
`content/projects/` 目录下创建 `.md` 文件

### 基本模板

```markdown
---
title: 项目名称
description: 项目简介
github: https://github.com/username/repo
tags:
  - React
  - TypeScript
techStack:
  - name: React
    icon: react
  - name: Node.js
    icon: nodejs
status: active
---

## 项目介绍

详细介绍...

## 功能特点

- 功能一
- 功能二

## 快速开始

安装和使用说明...
```

### Frontmatter 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 项目名称 |
| `description` | 是 | 简短描述 |
| `github` | 是 | GitHub 仓库地址 |
| `tags` | 否 | 技术标签 |
| `techStack` | 否 | 技术栈（带图标） |
| `status` | 否 | 状态：`active`/`archived`/`wip` |

---

## 五、规划文档 (Roadmaps)

### 文件位置
`content/roadmaps/` 目录下创建 `.md` 文件

### 基本模板

```markdown
---
title: 规划名称
description: 规划描述
items:
  - title: 已完成的任务
    status: completed
    description: 任务描述
  - title: 进行中的任务
    status: in-progress
    description: 任务描述
  - title: 计划中的任务
    status: planned
    description: 任务描述
---

## 规划详情

这里可以写更多详细说明...
```

### 任务状态

| 状态 | 说明 |
|------|------|
| `completed` | 已完成 |
| `in-progress` | 进行中 |
| `planned` | 计划中 |

---

## 六、独立知识图谱页面

### 文件位置
`content/graphs/` 目录下创建 `.json` 文件

### 基本模板

```json
{
  "name": "图谱名称",
  "description": "图谱描述",
  "nodes": [
    {
      "id": "1",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "节点1",
        "color": "red",
        "tags": ["核心"],
        "content": "详细说明"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "1",
      "target": "2"
    }
  ]
}
```

---

## 七、写作建议

### 文章结构

1. **引言** - 简要说明主题和目的
2. **正文** - 分章节展开
3. **总结** - 概括要点

### 排版技巧

- 适当使用标题分层，不要跳级
- 代码块指定语言获得高亮
- 重要内容使用**粗体**强调
- 列表让内容更清晰
- 适当加入图表和图谱

### SEO 建议

- 标题包含关键词
- 摘要简洁准确
- 标签选择常用词汇

---

## 八、本地预览

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:3000
```

修改内容后自动刷新，即时预览效果。

---

## 九、发布流程

1. 在 `content/` 目录下创建或修改文件
2. 本地预览确认无误
3. 提交并推送到 GitHub

```bash
git add .
git commit -m "添加新文章: 文章名称"
git push origin master
```

4. GitHub Actions 自动构建部署
5. 等待几分钟后访问网站查看

---

如有问题，请查阅项目 README 或提交 Issue。
