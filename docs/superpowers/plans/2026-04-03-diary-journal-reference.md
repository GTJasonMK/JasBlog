# Diary Journal Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `diary` detail pages read like journals and allow `/notes/*` and `/graphs/*` links inside diary entries to open in-site modal previews without changing Markdown syntax.

**Architecture:** Keep `diary/[slug]` as a server-rendered static page, extract only that day's internal references at build time, preload a serialized preview map, and hand the day plus preview data to a small client-side diary view. Refactor the oversized Markdown renderer into shared primitives so diary can override link behavior without forking the rest of the Markdown stack.

**Tech Stack:** Next.js App Router with `output: "export"`, React 19 client components, TypeScript, `react-markdown`, existing graph/note loaders, `node:test`, Tailwind plus prefixed global CSS classes.

---

## File Structure

- Create: `scripts/diary-reference-contract.test.ts`
  - Pure helper tests for extracting/deduping diary references and source-contract checks for page wiring/modal behavior.
- Modify: `package.json`
  - Add the new test file to the explicit `npm test` command list.
- Create: `src/lib/diary-references.ts`
  - Shared types plus pure helpers for parsing `/notes/*` and `/graphs/*` Markdown links and building a serializable preview map.
- Create: `src/components/markdown/createMarkdownComponents.tsx`
  - Shared Markdown component factory so link rendering can be overridden without duplicating headings/code/alerts/images.
- Create: `src/components/markdown/MarkdownContent.tsx`
  - Small wrapper that owns `react-markdown`, remark/rehype plugins, and shared component injection.
- Modify: `src/components/MarkdownRenderer.tsx`
  - Reduce to the default site renderer built on `MarkdownContent`.
- Modify: `src/components/ArticleContent.tsx`
  - Add optional flags so note previews can reuse article segmentation without TOC/back-to-top noise.
- Modify: `src/components/graph/GraphViewer.tsx`
  - Add compact sizing props so graph previews fit inside the modal.
- Create: `src/components/diary/DiaryDayView.tsx`
  - Client entry point for journal layout, modal state, and entry rendering.
- Create: `src/components/diary/DiaryEntryArticle.tsx`
  - Single diary entry block with time, title, tags, and journal-body typography.
- Create: `src/components/diary/DiaryReferenceMarkdown.tsx`
  - Diary-only Markdown renderer that highlights supported internal references and opens the modal.
- Create: `src/components/diary/DiaryReferenceModal.tsx`
  - Overlay shell with close button, backdrop click, `Esc`, and body-scroll lock.
- Create: `src/components/diary/DiaryReferencePreview.tsx`
  - Note preview branch, graph preview branch, and explicit missing-target branch.
- Modify: `src/app/diary/[slug]/page.tsx`
  - Preload reference previews on the server and hand everything to `DiaryDayView`.
- Modify: `src/app/globals.css`
  - Add prefixed `.diary-journal-*` and `.diary-reference-*` styles for the paper-like journal layout and modal.

## Task 1: Add Failing Diary Reference Tests

**Files:**
- Create: `scripts/diary-reference-contract.test.ts`
- Modify: `package.json`
- Read: `src/app/diary/[slug]/page.tsx`
- Read: `src/components/MarkdownRenderer.tsx`

- [ ] **Step 1: Write the failing test file**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  collectDiaryReferences,
  buildDiaryReferencePreviewMap,
} from "../src/lib/diary-references.ts";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("只提取 diary 中的 note / graph 内链并按 type+slug 去重", () => {
  const references = collectDiaryReferences([
    { content: "复盘了 [笔记 A](/notes/a) 和 [图谱 B](/graphs/b)。" },
    { content: "再次打开 [笔记 A](/notes/a)，外链 [官网](https://example.com) 不应进入预览。" },
  ]);

  assert.deepEqual(references, [
    { key: "note:a", type: "note", slug: "a", href: "/notes/a", label: "笔记 A" },
    { key: "graph:b", type: "graph", slug: "b", href: "/graphs/b", label: "图谱 B" },
  ]);
});

test("缺失引用目标时返回显式 missing 预览，而不是静默跳过", () => {
  const previews = buildDiaryReferencePreviewMap(
    [{ key: "note:missing", type: "note", slug: "missing", href: "/notes/missing", label: "丢失笔记" }],
    {
      getNoteBySlug: () => null,
      getGraphBySlug: () => null,
    }
  );

  assert.deepEqual(previews["note:missing"], {
    kind: "missing",
    referenceType: "note",
    slug: "missing",
    href: "/notes/missing",
    title: "丢失笔记",
    error: "未找到对应学习笔记：missing",
  });
});

test("diary 详情页会预加载引用预览，并交给专用 client 视图处理", () => {
  const source = readRepoFile("src/app/diary/[slug]/page.tsx");

  assert.match(source, /collectDiaryReferences/);
  assert.match(source, /buildDiaryReferencePreviewMap/);
  assert.match(source, /DiaryDayView/);
});

test("diary 引用弹窗支持 Esc 与遮罩关闭", () => {
  const source = readRepoFile("src/components/diary/DiaryReferenceModal.tsx");

  assert.match(source, /Escape/);
  assert.match(source, /document\.body\.style\.overflow/);
  assert.match(source, /onClick=\{\(\) => onClose\(\)\}/);
});
```

- [ ] **Step 2: Register the new test file in `npm test`**

```json
{
  "scripts": {
    "test": "node --test --experimental-strip-types scripts/graph-content.test.ts scripts/graph-document.test.ts scripts/heading-content.test.ts scripts/ui-copy.test.ts scripts/content-contract.test.ts scripts/diary-reference-contract.test.ts"
  }
}
```

- [ ] **Step 3: Run the targeted test to verify it fails**

Run: `node --test --experimental-strip-types scripts/diary-reference-contract.test.ts`

Expected: FAIL with module resolution or missing export errors for `src/lib/diary-references.ts`, plus source assertions failing because `DiaryDayView` and `DiaryReferenceModal` do not exist yet.

- [ ] **Step 4: Run the full test command once to confirm the new file is wired in**

Run: `npm test`

Expected: FAIL, and the output must include `scripts/diary-reference-contract.test.ts` in the executed file list.

- [ ] **Step 5: Commit the red test state**

```bash
git add package.json scripts/diary-reference-contract.test.ts
git commit -m "test: cover diary reference contracts"
```

## Task 2: Implement Static-Safe Diary Reference Utilities

**Files:**
- Create: `src/lib/diary-references.ts`
- Test: `scripts/diary-reference-contract.test.ts`

- [ ] **Step 1: Implement the reference types and pure helpers**

```ts
import type { DiaryEntry } from "./diary";
import type { Post } from "./posts";
import type { Graph } from "./graphs";

export type DiaryReferenceType = "note" | "graph";

export interface DiaryReferenceTarget {
  key: string;
  type: DiaryReferenceType;
  slug: string;
  href: string;
  label: string;
}

export type DiaryReferencePreview =
  | {
      kind: "note";
      slug: string;
      href: string;
      title: string;
      date: string;
      tags: string[];
      content: string;
      error?: string;
    }
  | {
      kind: "graph";
      slug: string;
      href: string;
      title: string;
      description: string;
      content: string;
      graphData: Graph["graphData"];
      error?: string;
    }
  | {
      kind: "missing";
      referenceType: DiaryReferenceType;
      slug: string;
      href: string;
      title: string;
      error: string;
    };

export type DiaryReferencePreviewMap = Record<string, DiaryReferencePreview>;

export interface DiaryReferenceLoaders {
  getNoteBySlug: (slug: string) => Post | null;
  getGraphBySlug: (slug: string) => Graph | null;
}
```

- [ ] **Step 2: Implement extraction, dedupe, and preview-building**

```ts
const INTERNAL_REFERENCE_REGEX = /\[([^\]]+)\]\((\/(?:notes|graphs)\/[^)\s#?]+)\)/g;

export function getDiaryReferenceKey(type: DiaryReferenceType, slug: string): string {
  return `${type}:${slug}`;
}

function parseDiaryReferenceHref(href: string): Pick<DiaryReferenceTarget, "type" | "slug"> | null {
  const matched = href.match(/^\/(notes|graphs)\/(.+)$/);
  if (!matched) return null;

  return {
    type: matched[1] === "notes" ? "note" : "graph",
    slug: decodeURIComponent(matched[2]),
  };
}

export function collectDiaryReferences(
  entries: readonly Pick<DiaryEntry, "content">[]
): DiaryReferenceTarget[] {
  const deduped = new Map<string, DiaryReferenceTarget>();

  for (const entry of entries) {
    for (const match of entry.content.matchAll(INTERNAL_REFERENCE_REGEX)) {
      const label = match[1]?.trim() || "";
      const href = match[2] || "";
      const parsed = parseDiaryReferenceHref(href);
      if (!parsed) continue;

      const key = getDiaryReferenceKey(parsed.type, parsed.slug);
      if (deduped.has(key)) continue;

      deduped.set(key, { key, href, label, ...parsed });
    }
  }

  return Array.from(deduped.values());
}

export function buildDiaryReferencePreviewMap(
  references: readonly DiaryReferenceTarget[],
  loaders: DiaryReferenceLoaders
): DiaryReferencePreviewMap {
  return Object.fromEntries(
    references.map((reference) => {
      if (reference.type === "note") {
        const note = loaders.getNoteBySlug(reference.slug);
        if (!note) {
          return [reference.key, {
            kind: "missing",
            referenceType: "note",
            slug: reference.slug,
            href: reference.href,
            title: reference.label,
            error: `未找到对应学习笔记：${reference.slug}`,
          }];
        }

        return [reference.key, {
          kind: "note",
          slug: note.slug,
          href: reference.href,
          title: note.title,
          date: note.date,
          tags: note.tags,
          content: note.content,
          error: note.error,
        }];
      }

      const graph = loaders.getGraphBySlug(reference.slug);
      if (!graph) {
        return [reference.key, {
          kind: "missing",
          referenceType: "graph",
          slug: reference.slug,
          href: reference.href,
          title: reference.label,
          error: `未找到对应知识图谱：${reference.slug}`,
        }];
      }

      return [reference.key, {
        kind: "graph",
        slug: graph.slug,
        href: reference.href,
        title: graph.name,
        description: graph.description,
        content: graph.content,
        graphData: graph.graphData,
        error: graph.error,
      }];
    })
  );
}
```

- [ ] **Step 3: Run the targeted test to verify the helper passes and source-contract assertions still fail**

Run: `node --test --experimental-strip-types scripts/diary-reference-contract.test.ts`

Expected: the pure helper tests now PASS, while source-contract assertions still FAIL because UI files are not implemented yet.

- [ ] **Step 4: Run the full test suite to ensure no unrelated regression**

Run: `npm test`

Expected: FAIL only in the new diary-reference source assertions; all older suites remain green.

- [ ] **Step 5: Commit the utility layer**

```bash
git add src/lib/diary-references.ts scripts/diary-reference-contract.test.ts package.json
git commit -m "feat: add diary reference utilities"
```

## Task 3: Extract Shared Markdown Primitives and Build Diary Markdown Override

**Files:**
- Create: `src/components/markdown/createMarkdownComponents.tsx`
- Create: `src/components/markdown/MarkdownContent.tsx`
- Create: `src/components/diary/DiaryReferenceMarkdown.tsx`
- Modify: `src/components/MarkdownRenderer.tsx`
- Test: `scripts/diary-reference-contract.test.ts`

- [ ] **Step 1: Refactor the shared Markdown renderer into a reusable wrapper**

```tsx
// src/components/markdown/MarkdownContent.tsx
"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { createMarkdownComponents, type MarkdownLinkRenderer } from "./createMarkdownComponents";

interface MarkdownContentProps {
  content: string;
  renderLink?: MarkdownLinkRenderer;
}

export function MarkdownContent({ content, renderLink }: MarkdownContentProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={createMarkdownComponents({ renderLink })}
    >
      {content}
    </Markdown>
  );
}
```

- [ ] **Step 2: Reduce the default renderer to a thin wrapper**

```tsx
// src/components/MarkdownRenderer.tsx
"use client";

import { MarkdownContent } from "@/components/markdown/MarkdownContent";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return <MarkdownContent content={content} />;
}
```

- [ ] **Step 3: Implement the diary-specific link override**

```tsx
// src/components/diary/DiaryReferenceMarkdown.tsx
"use client";

import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { getDiaryReferenceKey } from "@/lib/diary-references";

interface DiaryReferenceMarkdownProps {
  content: string;
  onOpenReference: (key: string) => void;
}

export default function DiaryReferenceMarkdown({
  content,
  onOpenReference,
}: DiaryReferenceMarkdownProps) {
  return (
    <MarkdownContent
      content={content}
      renderLink={({ href, children, ...props }, defaultLink) => {
        const matched = href?.match(/^\/(notes|graphs)\/(.+)$/);
        if (!matched) {
          return defaultLink({ href, children, ...props });
        }

        const type = matched[1] === "notes" ? "note" : "graph";
        const key = getDiaryReferenceKey(type, decodeURIComponent(matched[2]));

        return (
          <button
            type="button"
            className="diary-reference-link"
            onClick={() => onOpenReference(key)}
          >
            {children}
          </button>
        );
      }}
    />
  );
}
```

- [ ] **Step 4: Run the targeted test to verify the source assertions move forward**

Run: `node --test --experimental-strip-types scripts/diary-reference-contract.test.ts`

Expected: helper tests PASS, and the remaining failures now point to missing `DiaryDayView`, `DiaryReferenceModal`, or missing page wiring rather than Markdown infrastructure.

- [ ] **Step 5: Commit the Markdown refactor**

```bash
git add src/components/markdown/createMarkdownComponents.tsx src/components/markdown/MarkdownContent.tsx src/components/MarkdownRenderer.tsx src/components/diary/DiaryReferenceMarkdown.tsx
git commit -m "refactor: share markdown rendering primitives"
```

## Task 4: Build the Journal View, Modal, and Static Preview Wiring

**Files:**
- Create: `src/components/diary/DiaryDayView.tsx`
- Create: `src/components/diary/DiaryEntryArticle.tsx`
- Create: `src/components/diary/DiaryReferenceModal.tsx`
- Create: `src/components/diary/DiaryReferencePreview.tsx`
- Modify: `src/app/diary/[slug]/page.tsx`
- Modify: `src/components/ArticleContent.tsx`
- Modify: `src/components/graph/GraphViewer.tsx`
- Test: `scripts/diary-reference-contract.test.ts`

- [ ] **Step 1: Make article and graph renderers reusable inside the modal**

```tsx
// src/components/ArticleContent.tsx
import TableOfContents from "./TableOfContents";
import BackToTop from "./BackToTop";
import GraphViewer from "./graph/GraphViewer";
import MarkdownRenderer from "./MarkdownRenderer";
import { parseArticleContentSegments } from "@/lib/graph-content";
import { type GraphData } from "@/types/graph";

interface ArticleContentProps {
  content: string;
  showTableOfContents?: boolean;
  showBackToTop?: boolean;
}

export default function ArticleContent({
  content,
  showTableOfContents = true,
  showBackToTop = true,
}: ArticleContentProps) {
  const segments = parseArticleContentSegments(content);

  return (
    <>
      {showTableOfContents && <TableOfContents content={content} />}
      <article className="prose-chinese">
        {segments.map((segment, index) => {
          if (segment.type === "markdown") {
            return <MarkdownRenderer key={index} content={segment.content} />;
          }

          return (
            <div key={index} className="my-8 not-prose">
              <GraphViewer data={segment.data as GraphData} />
            </div>
          );
        })}
      </article>
      {showBackToTop && <BackToTop />}
    </>
  );
}

// src/components/graph/GraphViewer.tsx
import { useState } from "react";
import { type Node } from "@xyflow/react";
import GraphCanvas from "./GraphCanvas";
import NodeDetailPanel from "./NodeDetailPanel";
import { type GraphData } from "@/types/graph";

interface GraphViewerProps {
  data: GraphData;
  heightClassName?: string;
  panelWidthClassName?: string;
}

export default function GraphViewer({
  data,
  heightClassName = "h-[600px]",
  panelWidthClassName = "w-[320px]",
}: GraphViewerProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);

  return (
    <div className={`flex gap-4 ${heightClassName}`}>
      <div className="flex-1 relative rounded-lg overflow-hidden border border-[var(--color-border)]">
        <GraphCanvas
          data={data}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          showMinimap={showMinimap}
        />
      </div>
      {selectedNode && (
        <div className={`${panelWidthClassName} flex-shrink-0 rounded-lg overflow-hidden border border-[var(--color-border)]`}>
          <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build the modal and preview components**

```tsx
// src/components/diary/DiaryReferenceModal.tsx
"use client";

import { useEffect } from "react";

interface DiaryReferenceModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DiaryReferenceModal({ title, onClose, children }: DiaryReferenceModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="diary-reference-modal fixed inset-0 z-50">
      <button type="button" className="diary-reference-backdrop absolute inset-0" onClick={() => onClose()} aria-label="关闭引用预览" />
      <div className="diary-reference-panel relative mx-auto mt-10 max-h-[calc(100vh-5rem)] w-[min(1100px,92vw)] overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between border-b border-[var(--color-paper-darker)] px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-gray)]">Diary Reference</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{title}</h2>
          </div>
          <button type="button" className="rounded-full border border-[var(--color-paper-darker)] px-3 py-1 text-sm text-[var(--color-gray)]" onClick={() => onClose()}>
            关闭
          </button>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

```tsx
// src/components/diary/DiaryReferencePreview.tsx
"use client";

import ArticleContent from "@/components/ArticleContent";
import GraphViewer from "@/components/graph/GraphViewer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { DiaryReferencePreview as DiaryReferencePreviewData } from "@/lib/diary-references";

interface DiaryReferencePreviewProps {
  preview: DiaryReferencePreviewData;
}

export default function DiaryReferencePreview({ preview }: DiaryReferencePreviewProps) {
  if (preview.kind === "missing") {
    return <p className="text-sm text-[var(--color-danger)]">{preview.error}</p>;
  }

  if (preview.kind === "note") {
    return (
      <>
        <header className="mb-4">
          <h3 className="text-2xl font-bold">{preview.title}</h3>
          <p className="text-sm text-[var(--color-gray)]">{preview.date}</p>
        </header>
        <ArticleContent content={preview.content} showTableOfContents={false} showBackToTop={false} />
      </>
    );
  }

  return (
    <>
      <header className="mb-4">
        <h3 className="text-2xl font-bold">{preview.title}</h3>
        <p className="text-sm text-[var(--color-gray)]">{preview.description}</p>
      </header>
      {!preview.error && <GraphViewer data={preview.graphData} heightClassName="h-[360px]" panelWidthClassName="w-[260px]" />}
      {preview.content.trim() && <div className="prose-chinese mt-6"><MarkdownRenderer content={preview.content} /></div>}
    </>
  );
}
```

- [ ] **Step 3: Build the client journal view and wire server-side preloading**

```tsx
// src/app/diary/[slug]/page.tsx
import { getPostBySlug } from "@/lib/posts";
import { getGraphBySlug } from "@/lib/graphs";
import {
  collectDiaryReferences,
  buildDiaryReferencePreviewMap,
} from "@/lib/diary-references";
import DiaryDayView from "@/components/diary/DiaryDayView";

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const { slug } = await params;
  const day = getDiaryDayBySlug(decodeRouteSlug(slug));
  if (!day) notFound();

  const references = collectDiaryReferences(day.entries);
  const referencePreviews = buildDiaryReferencePreviewMap(references, {
    getNoteBySlug: getPostBySlug,
    getGraphBySlug,
  });

  return <DiaryDayView day={day} referencePreviews={referencePreviews} />;
}
```

```tsx
// src/components/diary/DiaryDayView.tsx
"use client";

import { useMemo, useState } from "react";
import type { DiaryDay } from "@/lib/diary";
import type { DiaryReferencePreviewMap } from "@/lib/diary-references";
import DiaryEntryArticle from "@/components/diary/DiaryEntryArticle";
import DiaryReferenceModal from "@/components/diary/DiaryReferenceModal";
import DiaryReferencePreview from "@/components/diary/DiaryReferencePreview";

export default function DiaryDayView({
  day,
  referencePreviews,
}: {
  day: DiaryDay;
  referencePreviews: DiaryReferencePreviewMap;
}) {
  const [activeReferenceKey, setActiveReferenceKey] = useState<string | null>(null);
  const activePreview = useMemo(
    () => (activeReferenceKey ? referencePreviews[activeReferenceKey] : null),
    [activeReferenceKey, referencePreviews]
  );

  return (
    <div className="diary-journal-shell max-w-5xl mx-auto px-6 py-12">
      <div className="diary-journal-page">
        <header className="border-b border-[var(--color-paper-darker)] bg-[var(--color-paper-dark)]/70 px-8 py-8">
          <p className="text-sm text-[var(--color-gray)]">{day.date}</p>
          <h1 className="mt-2 text-4xl font-bold text-[var(--color-ink)]">{day.title}</h1>
          {day.excerpt && <p className="mt-3 max-w-3xl text-[var(--color-gray)]">{day.excerpt}</p>}
        </header>

        <div className="diary-journal-paper px-8 py-8">
          {day.entries.map((entry) => (
            <DiaryEntryArticle key={entry.id} entry={entry} onOpenReference={setActiveReferenceKey} />
          ))}
        </div>
      </div>

      {activePreview && (
        <DiaryReferenceModal title={activePreview.title} onClose={() => setActiveReferenceKey(null)}>
          <DiaryReferencePreview preview={activePreview} />
        </DiaryReferenceModal>
      )}
    </div>
  );
}
```

```tsx
// src/components/diary/DiaryEntryArticle.tsx
"use client";

import type { DiaryEntry } from "@/lib/diary";
import DiaryReferenceMarkdown from "@/components/diary/DiaryReferenceMarkdown";

export default function DiaryEntryArticle({
  entry,
  onOpenReference,
}: {
  entry: DiaryEntry;
  onOpenReference: (key: string) => void;
}) {
  return (
    <article className="diary-journal-entry relative pl-6">
      <p className="text-xs font-mono tracking-[0.14em] text-[var(--color-gold)]">{entry.time}</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{entry.title}</h2>
      <div className="mt-4 diary-journal-copy">
        <DiaryReferenceMarkdown content={entry.content} onOpenReference={onOpenReference} />
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run the targeted test to verify all diary-reference assertions pass**

Run: `node --test --experimental-strip-types scripts/diary-reference-contract.test.ts`

Expected: PASS. The output should show four passing tests including helper logic and source-contract checks.

- [ ] **Step 5: Commit the feature wiring**

```bash
git add src/app/diary/[slug]/page.tsx src/components/ArticleContent.tsx src/components/graph/GraphViewer.tsx src/components/diary/DiaryDayView.tsx src/components/diary/DiaryEntryArticle.tsx src/components/diary/DiaryReferenceModal.tsx src/components/diary/DiaryReferencePreview.tsx
git commit -m "feat: add diary reference modal previews"
```

## Task 5: Apply Journal Styling and Run Full Verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/diary/DiaryDayView.tsx`
- Modify: `src/components/diary/DiaryEntryArticle.tsx`
- Verify: `scripts/diary-reference-contract.test.ts`

- [ ] **Step 1: Add prefixed journal and modal styles to the global stylesheet**

```css
.diary-journal-shell {
  position: relative;
}

.diary-journal-page {
  border: 1px solid var(--color-paper-darker);
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(201, 64, 67, 0.08), transparent 32%),
    linear-gradient(180deg, #f9f2e6 0%, #fffdf9 22%, #fffdf9 100%);
  box-shadow: 0 22px 44px rgba(56, 33, 12, 0.10);
}

.diary-journal-paper {
  position: relative;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.92)),
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 34px,
      rgba(112,145,185,0.14) 34px,
      rgba(112,145,185,0.14) 35px
    ),
    #fffefb;
}

.diary-reference-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  color: var(--color-vermilion);
  background: rgba(201, 64, 67, 0.08);
  border: 1px solid rgba(201, 64, 67, 0.12);
}

.diary-reference-panel {
  background: rgba(250, 245, 236, 0.98);
  border: 1px solid rgba(84, 58, 34, 0.14);
  box-shadow: 0 22px 44px rgba(36, 22, 9, 0.16);
}
```

- [ ] **Step 2: Run the targeted diary-reference suite**

Run: `node --test --experimental-strip-types scripts/diary-reference-contract.test.ts`

Expected: PASS with no failing assertions.

- [ ] **Step 3: Run the full repository test suite**

Run: `npm test`

Expected: PASS. The output should report all existing suites plus `scripts/diary-reference-contract.test.ts` with zero failures.

- [ ] **Step 4: Run the Windows production build used by this repo**

Run: `cmd.exe /c "cd /d E:\Code\Jas\JasBlog && npm run build"`

Expected: PASS. `next build` and `pagefind --site out` both succeed, and the route list still includes `/diary/[slug]`.

- [ ] **Step 5: Commit the final journal polish**

```bash
git add src/app/globals.css src/components/diary/DiaryDayView.tsx src/components/diary/DiaryEntryArticle.tsx
git commit -m "style: restyle diary detail as journal"
```
