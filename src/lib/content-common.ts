import fs from "fs";

export function formatDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value);
}

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\uFF0C\u3001]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function readUtf8FileIfExists(fullPath: string): string | null {
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf8");
}
