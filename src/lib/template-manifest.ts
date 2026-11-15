import fs from "node:fs";
import path from "node:path";
import { parseTemplateManifest } from "@jas/content-core";

export function getTemplateManifest() {
  const file = path.join(process.env.JASBLOG_WORKSPACE_ROOT ?? process.cwd(), "content/template-manifest.json");
  if (!fs.existsSync(file)) return { version: 1 as const, templates: [] };
  return parseTemplateManifest(JSON.parse(fs.readFileSync(file, "utf8")));
}
