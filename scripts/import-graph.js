const fs = require("node:fs");
const path = require("node:path");

async function importGraph({ inputPath, graphsDirectory, name, description, date }) {
  const { deserializeGraphData } = await import("@jas/graph-core");
  if (typeof name !== "string" || typeof description !== "string") throw new Error("图谱名称和描述必须为字符串。");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("日期必须使用 YYYY-MM-DD 格式。");
  const graph = deserializeGraphData(fs.readFileSync(inputPath, "utf8"));
  const slug = name.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "") || `graph-${Date.now()}`;
  const outputPath = path.join(graphsDirectory, `${slug}.md`);
  const markdown = ["---", `name: ${JSON.stringify(name)}`, `description: ${JSON.stringify(description)}`, `date: ${date}`, "---", "", "```graph", JSON.stringify(graph, null, 2), "```", ""].join("\n");
  fs.mkdirSync(graphsDirectory, { recursive: true });
  let descriptor;
  try {
    descriptor = fs.openSync(outputPath, "wx");
    fs.writeFileSync(descriptor, markdown, "utf8");
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
      descriptor = undefined;
      fs.unlinkSync(outputPath);
    }
    throw error;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
  return { outputPath, slug, nodeCount: graph.nodes.length, edgeCount: graph.edges.length };
}

async function main() {
  const [input, name, description, date = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
  if (input === undefined || name === undefined || description === undefined) throw new Error("Usage: node scripts/import-graph.js <input-file> <graph-name> <description> [date]");
  const graphsDirectory = path.join(__dirname, "..", "content", "graphs");
  const result = await importGraph({ inputPath: path.resolve(graphsDirectory, input), graphsDirectory, name, description, date });
  console.log(`Graph import completed: ${result.outputPath} (${result.nodeCount} nodes, ${result.edgeCount} edges)`);
}

module.exports = { importGraph };
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
