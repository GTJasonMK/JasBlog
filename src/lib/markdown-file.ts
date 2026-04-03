import fs from "fs";
import path from "path";

const MARKDOWN_FILE_REGEX = /\.md$/i;

export function isMarkdownFileName(fileName: string): boolean {
  return MARKDOWN_FILE_REGEX.test(fileName);
}

export function stripMarkdownExtension(fileName: string): string {
  return fileName.replace(MARKDOWN_FILE_REGEX, "");
}

export function resolveMarkdownFilePath(
  directory: string,
  slug: string
): string | null {
  if (!fs.existsSync(directory)) {
    return null;
  }

  const matchedFile = fs
    .readdirSync(directory)
    .find((fileName) => isMarkdownFileName(fileName) && stripMarkdownExtension(fileName) === slug);

  return matchedFile ? path.join(directory, matchedFile) : null;
}
