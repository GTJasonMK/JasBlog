"use client";

import { useState, useCallback, type ReactNode } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MermaidDiagram from "./MermaidDiagram";
import { createHeadingIdResolver } from "@/lib/heading-content";

// 浠?children 涓彁鍙栫函鏂囨湰
function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    const element = children as { props: { children?: ReactNode } };
    return extractText(element.props.children);
  }
  return "";
}

// 浠ｇ爜鍧楀鍒舵寜閽粍浠?
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        background: "rgba(255,255,255,0.1)",
        color: "#cdd6f4",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
      aria-label="Copy code"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// 鍥剧墖缂╂斁缁勪欢
function parseDimension(value?: string | number): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

// 鍥剧墖缂╂斁缁勪欢
function ImageZoom({
  src,
  alt,
  width,
  height,
}: {
  src?: string | undefined;
  alt?: string;
  width?: string | number;
  height?: string | number;
}) {
  const [zoomed, setZoomed] = useState(false);
  const resolvedWidth = parseDimension(width) ?? 1200;
  const resolvedHeight = parseDimension(height) ?? 675;

  if (!src || typeof src !== "string") return null;

  return (
    <>
      <span className="block my-6">
        <Image
          src={src}
          alt={alt || ""}
          width={resolvedWidth}
          height={resolvedHeight}
          unoptimized
          className="rounded-lg max-w-full h-auto mx-auto cursor-zoom-in"
          loading="lazy"
          onClick={() => setZoomed(true)}
        />
        {alt && (
          <span className="block text-center text-sm text-[var(--color-gray)] mt-2">
            {alt}
          </span>
        )}
      </span>
      {/* 鍥剧墖缂╂斁钂欏眰 */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-[90vw] h-[90vh]">
            <Image
              src={src}
              alt={alt || ""}
              fill
              unoptimized
              className="object-contain rounded-lg"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

// 瑙ｆ瀽 blockquote 涓殑 Alert 鏍囪
function parseAlertFromChildren(children: ReactNode): {
  type: string;
  content: ReactNode;
} | null {
  if (!children) return null;

  const childArray = Array.isArray(children) ? children : [children];

  // 閬嶅巻鎵€鏈夊瓙鍏冪礌锛屾煡鎵?Alert 鏍囪
  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (!child) continue;

    // 鎻愬彇鏂囨湰鍐呭
    const text = extractText(child);

    // 妫€鏌ユ槸鍚﹀寘鍚?ALERTBOX_TYPE_ALERTBOX 鏍囪
    const alertMatch = text.match(/^ALERTBOX(NOTE|TIP|IMPORTANT|WARNING|CAUTION)ALERTBOX\s*/i);
    if (alertMatch) {
      const alertType = alertMatch[1].toLowerCase();

      // 鑾峰彇鏍囪涔嬪悗鐨勫唴瀹癸紙濡傛灉鏈夌殑璇濓級
      const restText = text.slice(alertMatch[0].length).trim();
      // 鑾峰彇鍓╀綑鐨勫瓙鍏冪礌
      const restChildren = childArray.slice(i + 1);

      return {
        type: alertType,
        content: (
          <>
            {restText && <p>{restText}</p>}
            {restChildren}
          </>
        ),
      };
    }
  }

  return null;
}

// GitHub 椋庢牸 alert 绫诲瀷閰嶇疆
const ALERT_CONFIG: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  note: {
    label: "Note",
    className: "alert-note",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  },
  tip: {
    label: "Tip",
    className: "alert-tip",
    icon: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
  },
  important: {
    label: "Important",
    className: "alert-important",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z",
  },
  warning: {
    label: "Warning",
    className: "alert-warning",
    icon: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  },
  caution: {
    label: "Caution",
    className: "alert-caution",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.54-12.46L12 11.08 8.46 7.54 7.04 8.96 10.58 12.5l-3.54 3.54 1.42 1.42L12 13.92l3.54 3.54 1.42-1.42L13.42 12.5l3.54-3.54-1.42-1.42z",
  },
};

// 鏍囬缁勪欢锛堝甫閿氱偣閾炬帴锛?
function Heading({
  headingId,
  level,
  children,
  ...props
}: {
  headingId: string;
  level: 1 | 2 | 3 | 4;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const text = extractText(children);
  const Tag = `h${level}` as const;

  return (
    <Tag id={headingId} className="group/heading relative" {...props}>
      {children}
      <a
        href={`#${headingId}`}
        className="heading-anchor"
        aria-label={`Link to ${text}`}
        onClick={(e) => {
          e.preventDefault();
          const currentHeading = e.currentTarget.parentElement;
          if (currentHeading instanceof HTMLElement) {
            currentHeading.scrollIntoView({ behavior: "smooth" });
          } else {
            document.getElementById(headingId)?.scrollIntoView({ behavior: "smooth" });
          }
          history.replaceState(null, "", `#${headingId}`);
        }}
      >
        #
      </a>
    </Tag>
  );
}

// 浠ｇ爜鍧楃粍浠讹紙鏀寔 Mermaid锛?
function CodeBlock({ children }: { children?: ReactNode }) {
  // 浠?children 涓彁鍙栦唬鐮佸拰璇█
  let code = "";
  let language = "";
  if (children && typeof children === "object" && "props" in children) {
    const codeElement = children as {
      props: { children?: ReactNode; className?: string };
    };
    code = extractText(codeElement.props?.children);
    const className = codeElement.props?.className || "";
    const langMatch = className.match(/language-(\w+)/);
    language = langMatch ? langMatch[1] : "";
  }

  // Mermaid 鍥捐〃
  if (language === "mermaid") {
    return (
      <div className="my-6">
        <MermaidDiagram code={code} />
      </div>
    );
  }

  // 鏅€氫唬鐮佸潡
  return (
    <div className="code-block-wrapper">
      {language && <span className="code-block-lang">{language}</span>}
      <CopyButton code={code} />
      <pre>{children}</pre>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const resolveHeadingId = createHeadingIdResolver();

  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={{
        // 鏍囬
        h1: ({ children, ...props }) => (
          <Heading headingId={resolveHeadingId(extractText(children))} level={1} {...props}>
            {children}
          </Heading>
        ),
        h2: ({ children, ...props }) => (
          <Heading headingId={resolveHeadingId(extractText(children))} level={2} {...props}>
            {children}
          </Heading>
        ),
        h3: ({ children, ...props }) => (
          <Heading headingId={resolveHeadingId(extractText(children))} level={3} {...props}>
            {children}
          </Heading>
        ),
        h4: ({ children, ...props }) => (
          <Heading headingId={resolveHeadingId(extractText(children))} level={4} {...props}>
            {children}
          </Heading>
        ),
        // 閾炬帴
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
        // 鍥剧墖锛堝彲缂╂斁锛?
        img: ({ src, alt, width, height }) => {
          const imgSrc = typeof src === "string" ? src : undefined;
          return <ImageZoom src={imgSrc} alt={alt} width={width} height={height} />;
        },
        // 浠ｇ爜鍧楋紙甯﹀鍒舵寜閽€佽瑷€鏍囩銆丮ermaid 鏀寔锛?
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        // 寮曠敤鍧楋紙鏀寔 GitHub alert锛?
        blockquote: ({ children, ...props }) => {
          // 瑙ｆ瀽棰勫鐞嗗悗鐨?Alert 鏍囪
          const alert = parseAlertFromChildren(children);
          if (alert && ALERT_CONFIG[alert.type]) {
            const { label, className, icon } = ALERT_CONFIG[alert.type];
            return (
              <div className={`github-alert ${className}`}>
                <div className="github-alert-title">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d={icon} />
                  </svg>
                  {label}
                </div>
                <div className="github-alert-content">{alert.content}</div>
              </div>
            );
          }
          return <blockquote {...props}>{children}</blockquote>;
        },
        // 琛ㄦ牸
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

