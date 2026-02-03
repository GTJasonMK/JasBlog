/**
 * GraphAndTable 图谱导入脚本
 *
 * 用法：
 * 1. 将 GraphAndTable 导出的 JSON 文件放到 content/graphs/ 目录
 * 2. 运行 node scripts/import-graph.js <文件名> <图谱名称> <描述>
 *
 * 示例：
 * node scripts/import-graph.js graph_1234567890.json "React学习路径" "React 核心概念知识图谱"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('用法: node scripts/import-graph.js <文件名> <图谱名称> <描述>');
  console.log('示例: node scripts/import-graph.js graph_1234567890.json "React学习路径" "React 核心概念知识图谱"');
  process.exit(1);
}

const [filename, name, description] = args;
const graphsDir = path.join(__dirname, '..', 'content', 'graphs');
const inputPath = path.join(graphsDir, filename);

// 检查文件是否存在
if (!fs.existsSync(inputPath)) {
  console.error(`错误: 文件不存在 - ${inputPath}`);
  console.log(`请将 GraphAndTable 导出的 JSON 文件复制到 content/graphs/ 目录`);
  process.exit(1);
}

// 读取并解析 JSON
let graphData;
try {
  const content = fs.readFileSync(inputPath, 'utf-8');
  graphData = JSON.parse(content);
} catch (e) {
  console.error(`错误: JSON 解析失败 - ${e.message}`);
  process.exit(1);
}

// 验证格式
if (!graphData.nodes || !graphData.edges) {
  console.error('错误: 无效的图谱格式，缺少 nodes 或 edges 字段');
  process.exit(1);
}

// 添加元数据
const newGraphData = {
  name,
  description,
  nodes: graphData.nodes,
  edges: graphData.edges,
};

// 生成新文件名 (slug 格式)
const slug = name
  .toLowerCase()
  .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  .replace(/^-|-$/g, '');
const outputPath = path.join(graphsDir, `${slug}.json`);

// 写入文件
fs.writeFileSync(outputPath, JSON.stringify(newGraphData, null, 2), 'utf-8');

console.log(`成功导入图谱!`);
console.log(`- 文件: ${outputPath}`);
console.log(`- 名称: ${name}`);
console.log(`- 描述: ${description}`);
console.log(`- 节点数: ${graphData.nodes.length}`);
console.log(`- 连线数: ${graphData.edges.length}`);
console.log(`\n访问: /graphs/${slug}`);

// 如果输入文件和输出文件不同，提示删除原文件
if (inputPath !== outputPath) {
  console.log(`\n提示: 可以删除原文件 ${filename}`);
}
