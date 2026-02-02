"use client";

import ReadingProgress from "./ReadingProgress";
import BackToTop from "./BackToTop";

interface ProjectContentProps {
  content: string;
}

// 将 Markdown 内容转换为 HTML，并为标题添加 id
function renderMarkdown(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) {
        const text = line.slice(3);
        const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fa5-]/g, "");
        return `<h2 id="${id}">${text}</h2>`;
      }
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fa5-]/g, "");
        return `<h3 id="${id}">${text}</h3>`;
      }
      if (line.startsWith("- ")) {
        return `<li>${line.slice(2)}</li>`;
      }
      if (line.trim() === "") {
        return "";
      }
      return `<p>${line}</p>`;
    })
    .join("");
}

export default function ProjectContent({ content }: ProjectContentProps) {
  return (
    <>
      <ReadingProgress />
      <article className="prose-chinese">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      </article>
      <BackToTop />
    </>
  );
}
