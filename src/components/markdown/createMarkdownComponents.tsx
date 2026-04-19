"use client";

import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import {
  ALERT_CONFIG,
  CodeBlock,
  Heading,
  ImageZoom,
  extractText,
  parseAlertFromChildren,
} from "./MarkdownPrimitives";

export interface MarkdownLinkProps {
  href?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

export type MarkdownLinkRenderer = (
  props: MarkdownLinkProps,
  renderDefaultLink: (props: MarkdownLinkProps) => ReactNode
) => ReactNode;

interface CreateMarkdownComponentsOptions {
  resolveHeadingId: (text: string) => string;
  renderLink?: MarkdownLinkRenderer;
}

type MarkdownHeadingRenderer = NonNullable<Components["h1"]>;

function DefaultMarkdownLink({ href, children, ...props }: MarkdownLinkProps) {
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
}

DefaultMarkdownLink.displayName = "DefaultMarkdownLink";

function createDefaultLinkRenderer() {
  return DefaultMarkdownLink;
}

export function createMarkdownComponents({
  resolveHeadingId,
  renderLink,
}: CreateMarkdownComponentsOptions): Components {
  const renderDefaultLink = createDefaultLinkRenderer();

  function renderHeading(level: 1 | 2 | 3 | 4): MarkdownHeadingRenderer {
    const HeadingRenderer: MarkdownHeadingRenderer = ({
      children,
      ...props
    }) => (
      <Heading
        headingId={resolveHeadingId(extractText(children))}
        level={level}
        {...props}
      >
        {children}
      </Heading>
    );

    HeadingRenderer.displayName = `MarkdownHeading${level}`;
    return HeadingRenderer;
  }

  return {
    h1: renderHeading(1),
    h2: renderHeading(2),
    h3: renderHeading(3),
    h4: renderHeading(4),
    a: ({ href, children, ...props }) => {
      const linkProps: MarkdownLinkProps = { href, children, ...props };
      return renderLink ? renderLink(linkProps, renderDefaultLink) : renderDefaultLink(linkProps);
    },
    img: ({ src, alt, width, height }) => {
      const imageSrc = typeof src === "string" ? src : undefined;
      return <ImageZoom src={imageSrc} alt={alt} width={width} height={height} />;
    },
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    blockquote: ({ children, ...props }) => {
      const alert = parseAlertFromChildren(children);

      if (alert && ALERT_CONFIG[alert.type]) {
        const { label, className, icon } = ALERT_CONFIG[alert.type];

        return (
          <div className={`github-alert ${className}`}>
            <div className="github-alert-title">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
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
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table {...props}>{children}</table>
      </div>
    ),
  };
}
