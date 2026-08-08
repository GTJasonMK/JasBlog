"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { createHeadingIdResolver } from "@/lib/heading-content";
import { preprocessAlerts } from "@/lib/preprocess-alerts";
import { createMarkdownComponents } from "./createMarkdownComponents";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const resolveHeadingId = createHeadingIdResolver();

  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={createMarkdownComponents({ resolveHeadingId })}
    >
      {preprocessAlerts(content)}
    </Markdown>
  );
}
