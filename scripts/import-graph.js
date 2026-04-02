/**
 * Import a graph JSON export into content/graphs as markdown.
 *
 * Usage:
 *   node scripts/import-graph.js <input-file> <graph-name> <description> [date]
 *
 * Example:
 *   node scripts/import-graph.js graph_export.json "React Learning" "Core React concepts" 2026-02-18
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error("Usage: node scripts/import-graph.js <input-file> <graph-name> <description> [date]");
  process.exit(1);
}

const [inputFileArg, name, description, dateArg] = args;
const graphsDir = path.join(__dirname, "..", "content", "graphs");
const inputPath = path.isAbsolute(inputFileArg)
  ? inputFileArg
  : path.resolve(graphsDir, inputFileArg);

if (!fs.existsSync(inputPath)) {
  console.error(`ERROR: Input file not found: ${inputPath}`);
  process.exit(1);
}

let parsed;
try {
  const jsonText = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
  parsed = JSON.parse(jsonText);
} catch (error) {
  console.error(`ERROR: Failed to parse JSON: ${error.message}`);
  process.exit(1);
}

if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
  console.error("ERROR: Invalid graph JSON. Expected top-level 'nodes' and 'edges' arrays.");
  process.exit(1);
}

const graphData = {
  nodes: parsed.nodes,
  edges: parsed.edges,
};

const slugFromName = name
  .toLowerCase()
  .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
  .replace(/^-+|-+$/g, "");
const slug = slugFromName || `graph-${Date.now()}`;
const outputPath = path.join(graphsDir, `${slug}.md`);
const date = dateArg || new Date().toISOString().slice(0, 10);

const markdown = [
  "---",
  `name: ${JSON.stringify(name)}`,
  `description: ${JSON.stringify(description)}`,
  `date: ${date}`,
  "---",
  "",
  "```graph",
  JSON.stringify(graphData, null, 2),
  "```",
  "",
].join("\n");

fs.writeFileSync(outputPath, markdown, "utf8");

console.log("Graph import completed.");
console.log(`- Input: ${inputPath}`);
console.log(`- Output: ${outputPath}`);
console.log(`- Slug: ${slug}`);
console.log(`- Nodes: ${graphData.nodes.length}`);
console.log(`- Edges: ${graphData.edges.length}`);
console.log(`- URL: /graphs/${slug}`);

if (path.resolve(inputPath) !== path.resolve(outputPath)) {
  console.log(`Tip: You can remove the original file if it is no longer needed: ${inputPath}`);
}
