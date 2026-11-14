import { notFound } from "next/navigation";
import { BackToTop } from "@jas/content-ui/back-to-top";
import { getAllPublications } from "@/lib/publications";
import { paginate } from "@/lib/pagination";
import { getSite, sectionEnabled } from "@/lib/site";
import PublicationTimeline from "./PublicationTimeline";
import Pagination from "./Pagination";

export default function TimelinePage({ page = 1 }: { page?: number }) {
  if (!sectionEnabled("timeline")) notFound();
  const entries = getAllPublications();
  const pagination = paginate(entries, page);
  if (page > pagination.pageCount) notFound();
  return <div className="publication-page">
    <h1 className="sr-only">{getSite().sections.timeline.title}</h1>
    <section id="timeline-results" className="publication-results" tabIndex={-1} aria-label="发布记录">
      <div className="publication-toolbar"><p>首次发布</p><span>{entries.length} 条</span></div>
      {entries.length ? <PublicationTimeline entries={pagination.items} /> : <p className="content-empty">暂无发布记录。</p>}
      <div className="content-actions">
        <Pagination basePath="/timeline" anchor="timeline-results" label="发布时间线分页" page={page} pageCount={pagination.pageCount} pages={pagination.pages} />
        <BackToTop />
      </div>
    </section>
  </div>;
}
