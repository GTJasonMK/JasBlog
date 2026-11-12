import path from "node:path";
import { parseArgs } from "node:util";
import { importPhoto } from "@jas/site-tools";

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    title: { type: "string" }, alt: { type: "string" }, id: { type: "string" }, category: { type: "string" },
    date: { type: "string" }, location: { type: "string" }, camera: { type: "string" },
  } });
  if (positionals.length !== 1 || !values.title) throw new Error('用法：npm run photo:add -- <图片路径> --title "作品标题" [--category "分类"]');
  const { date, ...details } = values;
  const photo = await importPhoto({ ...details, inputPath: path.resolve(positionals[0]), title: values.title, takenAt: date });
  console.log(`已导入草稿：${photo.title}，ID: ${photo.id}。可在编辑器中预览并设为公开。`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
