import fs from "fs";
import path from "path";
import matter from "gray-matter";

const roadmapsDirectory = path.join(process.cwd(), "content/roadmaps");

// 将日期转换为字符串格式
function formatDate(date: unknown): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}

// 单个任务项
export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  deadline?: string;
  completedAt?: string; // 实际完成日期
}

// 规划的状态
export type RoadmapStatus = "active" | "completed" | "paused";

// 完整的规划（包含内容）
export interface Roadmap {
  slug: string;
  name: string;
  description: string;
  date: string;
  status: RoadmapStatus;
  items: RoadmapItem[];
  content: string; // 非任务的正文内容
}

// 规划元数据（列表用）
export interface RoadmapMeta {
  slug: string;
  name: string;
  description: string;
  date: string;
  status: RoadmapStatus;
  progress: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
  };
}

/**
 * 从 Markdown 正文解析任务列表
 *
 * 支持的格式：
 * - [ ] 任务标题 `priority`
 *   描述文本
 *   截止: 2026-06-01
 *
 * - [-] 进行中的任务 `high`
 * - [x] 已完成的任务
 */
function parseItemsFromContent(content: string): { items: RoadmapItem[]; remainingContent: string } {
  const lines = content.split("\n");
  const items: RoadmapItem[] = [];
  const nonTaskLines: string[] = [];

  let currentItem: RoadmapItem | null = null;
  let currentDescription: string[] = [];
  let itemId = 1;

  // 任务行正则：- [ ] 或 - [-] 或 - [x] 开头，后面是标题，可选 `priority`
  const taskRegex = /^-\s*\[([ x-])\]\s+(.+?)(?:\s+`(high|medium|low)`)?\s*$/;
  // 缩进行正则（至少2个空格）
  const indentRegex = /^(\s{2,})(.+)$/;
  // 截止日期正则
  const deadlineRegex = /^截止[:：]\s*(.+)$/;
  // 完成日期正则
  const completedAtRegex = /^完成[:：]\s*(.+)$/;

  const saveCurrentItem = () => {
    if (currentItem) {
      if (currentDescription.length > 0) {
        currentItem.description = currentDescription.join("\n").trim();
      }
      items.push(currentItem);
      currentItem = null;
      currentDescription = [];
    }
  };

  for (const line of lines) {
    const taskMatch = line.match(taskRegex);

    if (taskMatch) {
      // 保存之前的任务
      saveCurrentItem();

      // 解析新任务
      const [, checkbox, title, priority] = taskMatch;
      let status: RoadmapItem["status"] = "todo";
      if (checkbox === "x") status = "done";
      else if (checkbox === "-") status = "in_progress";

      currentItem = {
        id: String(itemId++),
        title: title.trim(),
        status,
        priority: (priority as RoadmapItem["priority"]) || "medium",
      };
    } else if (currentItem) {
      // 当前有任务，检查是否是缩进的描述行
      const indentMatch = line.match(indentRegex);
      if (indentMatch) {
        const text = indentMatch[2];
        const deadlineMatch = text.match(deadlineRegex);
        const completedAtMatch = text.match(completedAtRegex);
        if (deadlineMatch) {
          currentItem.deadline = deadlineMatch[1].trim();
        } else if (completedAtMatch) {
          currentItem.completedAt = completedAtMatch[1].trim();
        } else {
          currentDescription.push(text);
        }
      } else if (line.trim() === "") {
        // 空行，可能是任务之间的分隔
        // 继续保持当前任务状态，允许多段描述
      } else {
        // 非缩进的非空行，任务结束
        saveCurrentItem();
        nonTaskLines.push(line);
      }
    } else {
      // 没有当前任务，这是普通内容
      nonTaskLines.push(line);
    }
  }

  // 保存最后一个任务
  saveCurrentItem();

  return {
    items,
    remainingContent: nonTaskLines.join("\n").trim(),
  };
}

// 计算进度
function calculateProgress(items: RoadmapItem[]) {
  return {
    total: items.length,
    done: items.filter((i) => i.status === "done").length,
    inProgress: items.filter((i) => i.status === "in_progress").length,
    todo: items.filter((i) => i.status === "todo").length,
  };
}

// 获取所有规划的元数据（按日期排序）
export function getAllRoadmaps(): RoadmapMeta[] {
  if (!fs.existsSync(roadmapsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(roadmapsDirectory);
  const allRoadmaps = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(roadmapsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      // 从正文解析任务
      const { items } = parseItemsFromContent(content);

      return {
        slug,
        name: data.name || data.title || slug,
        description: data.description || "",
        date: formatDate(data.date),
        status: (data.status as RoadmapStatus) || "active",
        progress: calculateProgress(items),
      };
    });

  return allRoadmaps.sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 根据 slug 获取单个规划
export function getRoadmapBySlug(slug: string): Roadmap | null {
  const fullPath = path.join(roadmapsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 从正文解析任务和剩余内容
  const { items, remainingContent } = parseItemsFromContent(content);

  return {
    slug,
    name: data.name || data.title || slug,
    description: data.description || "",
    date: formatDate(data.date),
    status: (data.status as RoadmapStatus) || "active",
    items,
    content: remainingContent,
  };
}

// 获取所有规划的 slug
export function getAllRoadmapSlugs(): string[] {
  if (!fs.existsSync(roadmapsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(roadmapsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}
