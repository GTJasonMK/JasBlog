import { MarkdownContent } from "@/components/markdown/MarkdownContent";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return <MarkdownContent content={content} />;
}

