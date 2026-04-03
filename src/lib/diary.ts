import fs from "fs";
import path from "path";
import {
  parseFrontmatter,
  readFrontmatterString,
} from "./frontmatter";

const diaryDirectory = path.join(process.cwd(), "content/diary");
const dateSlugPattern = /^\d{4}-\d{2}-\d{2}$/;
// Supported file names: YYYY-MM-DD-HH-mm-title.md, YYYY-MM-DD-HH-mm.md, YYYY-MM-DD.md
const fileNamePattern = /^(\d{4}-\d{2}-\d{2})(?:-(\d{2})-(\d{2}))?(?:-(.+))?$/;

function formatDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value);
}

function normalizeTime(value: unknown): string {
  if (!value) return "";

  const raw = String(value).trim();
  const colonMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const hour = Number(colonMatch[1]);
    const minute = Number(colonMatch[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  const compactMatch = raw.match(/^(\d{2})(\d{2})$/);
  if (compactMatch) {
    const hour = Number(compactMatch[1]);
    const minute = Number(compactMatch[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${compactMatch[1]}:${compactMatch[2]}`;
    }
  }

  return "";
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\uFF0C\u3001]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function titleFromSlug(value: string): string {
  return value.replace(/[-_]+/g, " ").trim();
}

function parseFromFileName(fileName: string): {
  date: string;
  time: string;
  title: string;
} {
  const match = fileName.match(fileNamePattern);
  if (!match) {
    return { date: "", time: "", title: titleFromSlug(fileName) };
  }

  const [, date, hour, minute, titleSlug] = match;
  const time = hour && minute ? `${hour}:${minute}` : "";
  const title = titleSlug ? titleFromSlug(titleSlug) : date;

  return { date, time, title };
}

function readMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  entries.forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...readMarkdownFiles(fullPath));
      return;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  });

  return files;
}

function sortByTimeAsc(a: DiaryEntry, b: DiaryEntry): number {
  if (a.time === b.time) {
    return a.id.localeCompare(b.id);
  }
  return a.time.localeCompare(b.time);
}

export interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  excerpt: string;
  tags: string[];
  mood?: string;
  weather?: string;
  location?: string;
  companions: string[];
  content: string;
  error?: string;
}

export interface DiaryDayMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  entryCount: number;
  mood?: string;
  weather?: string;
  location?: string;
  error?: string;
}

export interface DiaryDay extends DiaryDayMeta {
  entries: DiaryEntry[];
}

function readDiaryEntries(): DiaryEntry[] {
  const files = readMarkdownFiles(diaryDirectory);
  const entries: DiaryEntry[] = [];

  files.forEach((filePath) => {
    const relativePath = path
      .relative(diaryDirectory, filePath)
      .replace(/\\/g, "/");
    const id = relativePath.replace(/\.md$/, "");
    const baseName = path.basename(filePath, ".md");
    const parsedFromName = parseFromFileName(baseName);

    const fileContents = fs.readFileSync(filePath, "utf8");
    const parsed = parseFrontmatter(fileContents, "diary");
    const { data, content, error } = parsed;

    const date = formatDate(data.date) || parsedFromName.date;
    if (!dateSlugPattern.test(date)) {
      return;
    }

    const time = normalizeTime(data.time) || normalizeTime(parsedFromName.time) || "00:00";
    const title =
      readFrontmatterString(data.title, parsedFromName.title, baseName) ||
      baseName;

    entries.push({
      id,
      title,
      date,
      time,
      excerpt: readFrontmatterString(data.excerpt) ?? "",
      tags: parseStringArray(data.tags),
      mood: readFrontmatterString(data.mood),
      weather: readFrontmatterString(data.weather),
      location: readFrontmatterString(data.location),
      companions: parseStringArray(data.companions),
      content,
      error,
    });
  });

  return entries;
}

function buildDiaryDay(date: string, entries: DiaryEntry[]): DiaryDay {
  const sortedEntries = [...entries].sort(sortByTimeAsc);
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  const mood =
    latestEntry.mood ||
    [...sortedEntries].reverse().map((entry) => entry.mood).find(Boolean);
  const weather =
    latestEntry.weather ||
    [...sortedEntries].reverse().map((entry) => entry.weather).find(Boolean);
  const location =
    latestEntry.location ||
    [...sortedEntries].reverse().map((entry) => entry.location).find(Boolean);

  const tags = Array.from(
    new Set(sortedEntries.flatMap((entry) => entry.tags))
  ).sort();

  const excerpt =
    latestEntry.excerpt ||
    sortedEntries.map((entry) => entry.excerpt).find(Boolean) ||
    "";
  const error = sortedEntries.map((entry) => entry.error).find(Boolean);

  const title =
    sortedEntries.length === 1 ? sortedEntries[0].title : `${date} 考研日志`;

  return {
    slug: date,
    title,
    date,
    excerpt,
    tags,
    entryCount: sortedEntries.length,
    mood,
    weather,
    location,
    error,
    entries: sortedEntries,
  };
}

function buildDiaryDays(): DiaryDay[] {
  const entries = readDiaryEntries();
  const grouped = new Map<string, DiaryEntry[]>();

  entries.forEach((entry) => {
    const current = grouped.get(entry.date) || [];
    current.push(entry);
    grouped.set(entry.date, current);
  });

  return Array.from(grouped.entries())
    .map(([date, dayEntries]) => buildDiaryDay(date, dayEntries))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAllDiaryDays(): DiaryDayMeta[] {
  return buildDiaryDays().map((day) => ({
    slug: day.slug,
    title: day.title,
    date: day.date,
    excerpt: day.excerpt,
    tags: day.tags,
    entryCount: day.entryCount,
    mood: day.mood,
    weather: day.weather,
    location: day.location,
    error: day.error,
  }));
}

export function getDiaryDayBySlug(slug: string): DiaryDay | null {
  if (!dateSlugPattern.test(slug)) {
    return null;
  }

  return buildDiaryDays().find((day) => day.slug === slug) || null;
}

export function getAllDiaryDaySlugs(): string[] {
  return getAllDiaryDays().map((day) => day.slug);
}
