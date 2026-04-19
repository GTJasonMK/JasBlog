"use client";

import TableOfContents from "./TableOfContents";
import BackToTop from "./BackToTop";
import GraphViewer from "./graph/GraphViewer";
import MarkdownRenderer from "./MarkdownRenderer";
import { parseArticleContentSegments } from "@/lib/graph-content";
import { type GraphData } from "@/types/graph";

interface ArticleContentProps {
  content: string;
  showTableOfContents?: boolean;
  showBackToTop?: boolean;
}

export default function ArticleContent({
  content,
  showTableOfContents = true,
  showBackToTop = true,
}: ArticleContentProps) {
  const segments = parseArticleContentSegments(content);

  return (
    <>
      {showTableOfContents ? <TableOfContents content={content} /> : null}
      <article className="prose-chinese">
        {segments.map((segment, index) => {
          if (segment.type === "markdown") {
            return <MarkdownRenderer key={index} content={segment.content} />;
          }

          return (
            <div key={index} className="my-8 not-prose">
              <GraphViewer data={segment.data as GraphData} />
            </div>
          );
        })}
      </article>
      {showBackToTop ? <BackToTop /> : null}
    </>
  );
}
