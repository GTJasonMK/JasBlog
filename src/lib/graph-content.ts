type GraphData = {
  nodes: unknown[];
  edges: unknown[];
};

export type ArticleContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'graph'; data: GraphData };

function isValidGraphData(value: unknown): value is GraphData {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj.nodes) && Array.isArray(obj.edges);
}

export function parseArticleContentSegments(content: string): ArticleContentSegment[] {
  const segments: ArticleContentSegment[] = [];
  const graphBlockRegex = /```graph\s*\r?\n([\s\S]*?)\r?\n```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = graphBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const markdownContent = content.slice(lastIndex, match.index).trim();
      if (markdownContent) {
        segments.push({ type: 'markdown', content: markdownContent });
      }
    }

    try {
      const graphJson = match[1].trim();
      const parsed = JSON.parse(graphJson) as unknown;

      if (isValidGraphData(parsed)) {
        segments.push({ type: 'graph', data: parsed });
      } else {
        segments.push({
          type: 'markdown',
          content: '```json\n' + match[1] + '```',
        });
      }
    } catch (error) {
      console.error('Failed to parse graph data:', error);
      segments.push({
        type: 'markdown',
        content: '```json\n' + match[1] + '```',
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex).trim();
    if (remainingContent) {
      segments.push({ type: 'markdown', content: remainingContent });
    }
  }

  return segments;
}
