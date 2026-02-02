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
  content: string;
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

// 解析任务列表
function parseItems(items: unknown): RoadmapItem[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item, index) => ({
    id: item.id || String(index + 1),
    title: item.title || "",
    description: item.description,
    status: item.status || "todo",
    priority: item.priority || "medium",
    deadline: item.deadline,
  }));
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
      const { data } = matter(fileContents);
      const items = parseItems(data.items);

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

  return {
    slug,
    name: data.name || data.title || slug,
    description: data.description || "",
    date: formatDate(data.date),
    status: (data.status as RoadmapStatus) || "active",
    items: parseItems(data.items),
    content,
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
