import path from "node:path";
import { editorStateDirectory, migrateWorkspace } from "@jas/site-tools";

const root = process.cwd();
const backup = path.resolve(process.argv[2] ?? path.join(root, ".run/site-migration", new Date().toISOString().replace(/[:.]/g, "-")));
migrateWorkspace(root, backup, undefined, { editorStateDirectory: editorStateDirectory() }).then((files) => {
  console.log(`迁移完成：${files.length} 个文件。原始备份与迁移记录：${backup}`);
}).catch((error: unknown) => { console.error(error); process.exitCode = 1; });
