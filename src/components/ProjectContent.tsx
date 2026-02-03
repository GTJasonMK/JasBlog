"use client";

import ReadingProgress from "./ReadingProgress";
import BackToTop from "./BackToTop";
import MarkdownRenderer from "./MarkdownRenderer";

interface ProjectContentProps {
  content: string;
}

export default function ProjectContent({ content }: ProjectContentProps) {
  return (
    <>
      <ReadingProgress />
      <article className="prose-chinese">
        <MarkdownRenderer content={content} />
      </article>
      <BackToTop />
    </>
  );
}
