import fs from "fs";
import path from "path";
import {
  parseFrontmatter,
  readFrontmatterString,
} from "./frontmatter";
import {
  isMarkdownFileName,
  stripMarkdownExtension,
} from "./markdown-file";
import { compareDateDescThenSlug } from "./date-sort";
import {
  buildDiaryDaySummary,
  DIARY_DATE_PATTERN,
  inferDiaryFromFileName,
  sortDiaryEntriesByTimeAsc,
  titleFromSlug,
} from "./diary-contract";
import {
  formatDate,
  parseStringArray,
} from "./content-common";

const diaryDirectory = path.join(process.cwd(), "content/diary");

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

function parseFromFileName(fileName: string): {
  date: string;
  time: string;
  title: string;
} {
  const inferred = inferDiaryFromFileName(fileName);
  if (!inferred) return { date: "", time: "", title: titleFromSlug(fileName) };
  return inferred;
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

    if (entry.isFile() && isMarkdownFileName(entry.name)) {
      files.push(fullPath);
    }
  });

  return files;
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
    const id = stripMarkdownExtension(relativePath);
    const baseName = stripMarkdownExtension(path.basename(filePath));
    const parsedFromName = parseFromFileName(baseName);

    const fileContents = fs.readFileSync(filePath, "utf8");
    const parsed = parseFrontmatter(fileContents, "diary");
    const { data, content, error } = parsed;

    const date = formatDate(data.date) || parsedFromName.date;
    if (!DIARY_DATE_PATTERN.test(date)) {
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
  const sortedEntries = [...entries].sort(sortDiaryEntriesByTimeAsc);
  const summary = buildDiaryDaySummary(date, sortedEntries);
  const error = sortedEntries.map((entry) => entry.error).find(Boolean);

  return {
    ...summary,
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
    .sort(compareDateDescThenSlug);
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
  if (!DIARY_DATE_PATTERN.test(slug)) {
    return null;
  }

  return buildDiaryDays().find((day) => day.slug === slug) || null;
}

export function getAllDiaryDaySlugs(): string[] {
  return getAllDiaryDays().map((day) => day.slug);
}
