import { publicationDay, type JasBlogContentType } from "@jas/content-core";

export interface PublicationEntry {
  id: string; type: JasBlogContentType | "photo"; label: string;
  title: string; description: string; href: string; publishedAt?: string;
}
export type TimelineEntry = PublicationEntry & { day: string };

export function orderPublications(entries: readonly PublicationEntry[]): TimelineEntry[] {
  return entries.map((entry) => ({ ...entry, day: entry.publishedAt ? publicationDay(entry.publishedAt) : "" })).sort((a, b) => {
    if (a.day !== b.day) return a.day > b.day ? -1 : 1;
    const left = a.publishedAt?.includes("T") ? Date.parse(a.publishedAt) : -Infinity;
    const right = b.publishedAt?.includes("T") ? Date.parse(b.publishedAt) : -Infinity;
    if (left !== right) return left > right ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function groupPublications(entries: readonly TimelineEntry[]) {
  const groups: Array<{ month: string; entries: TimelineEntry[] }> = [];
  for (const entry of entries) {
    const month = entry.day.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last?.month === month) last.entries.push(entry);
    else groups.push({ month, entries: [entry] });
  }
  return groups;
}
