"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { createHeadingIdResolver } from "@/lib/heading-content";
import {
  createMarkdownComponents,
  type MarkdownLinkRenderer,
} from "./createMarkdownComponents";

interface MarkdownContentProps {
  content: string;
  renderLink?: MarkdownLinkRenderer;
}

export function MarkdownContent({
  content,
  renderLink,
}: MarkdownContentProps) {
  const resolveHeadingId = createHeadingIdResolver();

  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={createMarkdownComponents({
        resolveHeadingId,
        renderLink,
      })}
    >
      {content}
    </Markdown>
  );
}
