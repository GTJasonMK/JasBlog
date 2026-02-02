"use client";

import TableOfContents from "./TableOfContents";
import ReadingProgress from "./ReadingProgress";
import BackToTop from "./BackToTop";
import GraphViewer from "./graph/GraphViewer";
import { type GraphData } from "@/types/graph";

interface ArticleContentProps {
  content: string;
}

// 内容段落类型
type ContentSegment =
  | { type: "markdown"; content: string }
  | { type: "graph"; data: GraphData };

// 解析内容，分离 markdown 和 graph 代码块
function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const graphBlockRegex = /```graph\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = graphBlockRegex.exec(content)) !== null) {
    // 添加 graph 块之前的 markdown 内容
    if (match.index > lastIndex) {
      const markdownContent = content.slice(lastIndex, match.index).trim();
      if (markdownContent) {
        segments.push({ type: "markdown", content: markdownContent });
      }
    }

    // 解析 graph 数据
    try {
      const graphJson = match[1].trim();
      const graphData = JSON.parse(graphJson) as GraphData;
      segments.push({ type: "graph", data: graphData });
    } catch (e) {
      // JSON 解析失败，作为普通代码块显示
      console.error("Failed to parse graph data:", e);
      segments.push({
        type: "markdown",
        content: "```json\n" + match[1] + "```",
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余的 markdown 内容
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex).trim();
    if (remainingContent) {
      segments.push({ type: "markdown", content: remainingContent });
    }
  }

  return segments;
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

export default function ArticleContent({ content }: ArticleContentProps) {
  const segments = parseContent(content);

  return (
    <>
      <ReadingProgress />
      <TableOfContents content={content} />
      <article className="prose-chinese">
        {segments.map((segment, index) => {
          if (segment.type === "markdown") {
            return (
              <div
                key={index}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(segment.content) }}
              />
            );
          } else {
            return (
              <div key={index} className="my-8 not-prose">
                <GraphViewer data={segment.data} />
              </div>
            );
          }
        })}
      </article>
      <BackToTop />
    </>
  );
}
