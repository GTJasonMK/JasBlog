const DIARY_FILE_NAME_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:-(\d{2})-(\d{2}))?(?:-(.+))?$/;

export const DIARY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DiaryNameInference {
  date: string;
  time: string;
  title: string;
}

export interface DiaryEntrySummaryLike {
  id: string;
  title: string;
  date: string;
  time: string;
  excerpt: string;
  tags: string[];
  mood?: string;
  weather?: string;
  location?: string;
}

export interface DiaryDaySummary {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  entryCount: number;
  mood?: string;
  weather?: string;
  location?: string;
}

function normalizeSlashes(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function titleFromSlug(value: string): string {
  return value.replace(/[-_]+/g, " ").trim();
}

export function inferDiaryFromFileName(fileNameNoExt: string): DiaryNameInference | null {
  const match = fileNameNoExt.match(DIARY_FILE_NAME_PATTERN);
  if (!match) return null;

  const [, date, hour, minute, titleSlug] = match;
  return {
    date,
    time: hour && minute ? `${hour}:${minute}` : "",
    title: titleSlug ? titleFromSlug(titleSlug) : date,
  };
}

export function resolveDiaryDate(metaDate?: string, inferredDate?: string): string {
  const normalizedMetaDate = (metaDate || "").trim();
  if (DIARY_DATE_PATTERN.test(normalizedMetaDate)) return normalizedMetaDate;

  const normalizedInferredDate = (inferredDate || "").trim();
  return DIARY_DATE_PATTERN.test(normalizedInferredDate) ? normalizedInferredDate : "";
}

export function buildDiaryEntryId(filePath: string, diaryRootPath: string): string {
  const normalizedPath = normalizeSlashes(filePath);
  const normalizedRoot = normalizeSlashes(diaryRootPath).replace(/\/+$/, "");
  const prefix = normalizedRoot ? `${normalizedRoot}/` : "";

  if (prefix && normalizedPath.startsWith(prefix)) {
    return normalizedPath.slice(prefix.length).replace(/\.md$/i, "");
  }
  return (normalizedPath.split("/").pop() || normalizedPath).replace(/\.md$/i, "");
}

export function sortDiaryEntriesByTimeAsc<T extends Pick<DiaryEntrySummaryLike, "id" | "time">>(a: T, b: T): number {
  if (a.time === b.time) return a.id.localeCompare(b.id);
  return a.time.localeCompare(b.time);
}

export function buildDiaryDaySummary<T extends DiaryEntrySummaryLike>(date: string, entries: readonly T[]): DiaryDaySummary {
  const sortedEntries = [...entries].sort(sortDiaryEntriesByTimeAsc);
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const reverseEntries = [...sortedEntries].reverse();

  return {
    slug: date,
    title: sortedEntries.length === 1 ? sortedEntries[0].title : `${date} 考研日志`,
    date,
    excerpt: latestEntry.excerpt || sortedEntries.map((entry) => entry.excerpt).find(Boolean) || "",
    tags: Array.from(new Set(sortedEntries.flatMap((entry) => entry.tags))).sort(),
    entryCount: sortedEntries.length,
    mood: latestEntry.mood || reverseEntries.map((entry) => entry.mood).find(Boolean),
    weather: latestEntry.weather || reverseEntries.map((entry) => entry.weather).find(Boolean),
    location: latestEntry.location || reverseEntries.map((entry) => entry.location).find(Boolean),
  };
}
