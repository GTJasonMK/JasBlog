import matter from "gray-matter";

const FRONTMATTER_BODY_REGEX = /^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/;

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
  error?: string;
}

export function readFrontmatterString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }
  return undefined;
}

function extractBody(raw: string): string {
  const matched = raw.match(FRONTMATTER_BODY_REGEX);
  if (!matched) {
    return raw.replace(/^\uFEFF/, "");
  }
  return matched[1];
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.split("\n")[0] || error.message;
  }
  return String(error);
}

export function parseFrontmatter(raw: string, label: string): ParsedFrontmatter {
  try {
    const { data, content } = matter(raw);
    return {
      data: data as Record<string, unknown>,
      content,
    };
  } catch (error) {
    return {
      data: {},
      content: extractBody(raw),
      error: `${label} frontmatter YAML 解析失败：${getErrorMessage(error)}`,
    };
  }
}
