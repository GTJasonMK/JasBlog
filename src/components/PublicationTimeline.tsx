import Link from "next/link";
import { formatPublishedAt } from "@jas/content-core";
import { groupPublications, type TimelineEntry } from "@/lib/publication-timeline";

export default function PublicationTimeline({ entries }: { entries: readonly TimelineEntry[] }) {
  return <div className="publication-groups">{groupPublications(entries).map(({ month, entries }) => <section className="publication-month" key={month} aria-label={month ? `${month.slice(0, 4)}年${Number(month.slice(5))}月` : "日期待补录"}>
    <h2>{month ? `${month.slice(0, 4)}年${Number(month.slice(5))}月` : "日期待补录"}</h2>
    <ol>{entries.map((entry) => <li key={entry.id} className="publication-entry" data-publication-id={entry.id}>
      <Link href={entry.href} className="publication-entry-link" prefetch={false}>
        <div className="publication-entry-meta"><span className="publication-kind">{entry.label}</span>{entry.publishedAt && <time dateTime={entry.publishedAt}>{formatPublishedAt(entry.publishedAt)}</time>}</div>
        <h3>{entry.title}</h3>
        {entry.description && <p>{entry.description}</p>}
      </Link>
    </li>)}</ol>
  </section>)}</div>;
}
