"use client";

import { useCallback, useState, type ReactNode } from "react";
import Image from "next/image";
import MermaidDiagram from "@/components/MermaidDiagram";

export function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    const element = children as { props: { children?: ReactNode } };
    return extractText(element.props.children);
  }
  return "";
}

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
      aria-label="复制代码"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}

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

export function ImageZoom({
  src,
  alt,
  width,
  height,
}: {
  src?: string;
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

export function parseAlertFromChildren(children: ReactNode): {
  type: string;
  content: ReactNode;
} | null {
  if (!children) return null;

  const childArray = Array.isArray(children) ? children : [children];

  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (!child) continue;

    const text = extractText(child);
    const alertMatch = text.match(
      /^ALERTBOX(NOTE|TIP|IMPORTANT|WARNING|CAUTION)ALERTBOX\s*/i
    );

    if (!alertMatch) continue;

    const alertType = alertMatch[1].toLowerCase();
    const restText = text.slice(alertMatch[0].length).trim();
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

  return null;
}

export const ALERT_CONFIG: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  note: {
    label: "提示",
    className: "alert-note",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  },
  tip: {
    label: "技巧",
    className: "alert-tip",
    icon: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
  },
  important: {
    label: "重要",
    className: "alert-important",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z",
  },
  warning: {
    label: "警告",
    className: "alert-warning",
    icon: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  },
  caution: {
    label: "注意",
    className: "alert-caution",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.54-12.46L12 11.08 8.46 7.54 7.04 8.96 10.58 12.5l-3.54 3.54 1.42 1.42L12 13.92l3.54 3.54 1.42-1.42L13.42 12.5l3.54-3.54-1.42-1.42z",
  },
};

export function Heading({
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
        aria-label={`定位到 ${text}`}
        onClick={(event) => {
          event.preventDefault();
          const currentHeading = event.currentTarget.parentElement;

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

export function CodeBlock({ children }: { children?: ReactNode }) {
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

  if (language === "mermaid") {
    return (
      <div className="my-6">
        <MermaidDiagram code={code} />
      </div>
    );
  }

  return (
    <div className="code-block-wrapper">
      {language && <span className="code-block-lang">{language}</span>}
      <CopyButton code={code} />
      <pre>{children}</pre>
    </div>
  );
}
