import TableOfContents from "./TableOfContents";
import BackToTop from "./BackToTop";
import GraphViewer from "./graph/GraphViewer";
import { MarkdownContent } from "./markdown/MarkdownContent";
import { parseArticleContentSegments } from "@/lib/graph-content";

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
            return <MarkdownContent key={index} content={segment.content} />;
          }

          return (
            <div key={index} className="my-8 not-prose">
              <GraphViewer data={segment.data} />
            </div>
          );
        })}
      </article>
      {showBackToTop ? <BackToTop /> : null}
    </>
  );
}
