"use client";

import TableOfContents from "./TableOfContents";
import BackToTop from "./BackToTop";
import GraphViewer from "./graph/GraphViewer";
import MarkdownRenderer from "./MarkdownRenderer";
import { parseArticleContentSegments } from "@/lib/graph-content";
import { type GraphData } from "@/types/graph";

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const segments = parseArticleContentSegments(content);

  return (
    <>
      <TableOfContents content={content} />
      <article className="prose-chinese">
        {segments.map((segment, index) => {
          if (segment.type === "markdown") {
            return <MarkdownRenderer key={index} content={segment.content} />;
          } else {
            return (
              <div key={index} className="my-8 not-prose">
                <GraphViewer data={segment.data as GraphData} />
              </div>
            );
          }
        })}
      </article>
      <BackToTop />
    </>
  );
}
