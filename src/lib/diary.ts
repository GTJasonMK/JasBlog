import path from "path";
import { stripMarkdownExtension, isCalendarDate } from "@jas/content-core";
import { readParsedContentFiles } from "./content-repository";
import {
  groupDiaryEntries,
  DIARY_DATE_PATTERN,
  inferDiaryFromFileName,
} from "@jas/content-core/diary-contract";
import { resolveDiaryDisplay, type DiaryMetadata, type DiaryEntry as SharedDiaryEntry, type DiaryDay as SharedDiaryDay, type DiaryListEntry } from "@jas/content-core";

const diaryDirectory = path.join(process.cwd(), "content/diary");

export type DiaryEntry = SharedDiaryEntry;
export type DiaryDayMeta = DiaryListEntry;
export type DiaryDay = SharedDiaryDay;

export function getAllDiaryEntries(): DiaryEntry[] {
  const files = readParsedContentFiles(diaryDirectory, "diary", true);
  const entries: DiaryEntry[] = [];

  files.forEach(({ fullPath: filePath, parsed }) => {
    const relativePath = path
      .relative(diaryDirectory, filePath)
      .replace(/\\/g, "/");
    const id = stripMarkdownExtension(relativePath);
    const baseName = stripMarkdownExtension(path.basename(filePath));
    const parsedFromName = inferDiaryFromFileName(baseName);

    const metadata = parsed.metadata as DiaryMetadata;
    const display = resolveDiaryDisplay(baseName, metadata, parsedFromName);
    const { date, title } = display;
    if (!isCalendarDate(date)) {
      throw new Error(`日记日期无效：${relativePath}`);
    }

    entries.push({
      id,
      ...metadata,
      title,
      date,
      time: display.time,
      tags: metadata.tags ?? [],
      content: parsed.content,
      error: parsed.issues.join("\n") || undefined,
    });
  });

  return entries;
}

function buildDiaryDays(): DiaryDay[] {
  return groupDiaryEntries(getAllDiaryEntries());
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
