"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
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

// 为标题生成 ID
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");
}

// Markdown 渲染组件
function MarkdownRenderer({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // 标题添加 id 用于目录导航
        h1: ({ children, ...props }) => {
          const id = generateId(String(children));
          return <h1 id={id} {...props}>{children}</h1>;
        },
        h2: ({ children, ...props }) => {
          const id = generateId(String(children));
          return <h2 id={id} {...props}>{children}</h2>;
        },
        h3: ({ children, ...props }) => {
          const id = generateId(String(children));
          return <h3 id={id} {...props}>{children}</h3>;
        },
        h4: ({ children, ...props }) => {
          const id = generateId(String(children));
          return <h4 id={id} {...props}>{children}</h4>;
        },
        // 链接在新窗口打开外部链接
        a: ({ href, children, ...props }) => {
          const isExternal = href?.startsWith("http");
          return (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          );
        },
        // 图片添加样式
        img: ({ src, alt, ...props }) => (
          <span className="block my-6">
            <img
              src={src}
              alt={alt || ""}
              className="rounded-lg max-w-full h-auto mx-auto"
              loading="lazy"
              {...props}
            />
            {alt && (
              <span className="block text-center text-sm text-[var(--color-gray)] mt-2">
                {alt}
              </span>
            )}
          </span>
        ),
        // 代码块
        pre: ({ children, ...props }) => (
          <pre className="relative group" {...props}>
            {children}
          </pre>
        ),
        // 表格容器添加滚动
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-6">
            <table {...props}>{children}</table>
          </div>
        ),
      }}
    >
      {content}
    </Markdown>
  );
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
            return <MarkdownRenderer key={index} content={segment.content} />;
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
