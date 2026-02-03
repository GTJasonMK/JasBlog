"use client";

import BackToTop from "./BackToTop";
import MarkdownRenderer from "./MarkdownRenderer";

interface ProjectContentProps {
  content: string;
}

export default function ProjectContent({ content }: ProjectContentProps) {
  return (
    <>
      <article className="prose-chinese">
        <MarkdownRenderer content={content} />
      </article>
      <BackToTop />
    </>
  );
}
