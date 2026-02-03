#!/usr/bin/env node

/**
 * 自动检测 content 目录变更并提交推送
 * 用法: node scripts/auto-commit-content.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 内容类型映射
const CONTENT_TYPES = {
  notes: "笔记",
  projects: "项目",
  roadmaps: "规划",
  graphs: "图表",
};

// 操作类型映射
const ACTION_TYPES = {
  A: "添加",
  M: "更新",
  D: "删除",
  R: "重命名",
};

/**
 * 执行 git 命令
 */
function git(command) {
  try {
    return execSync(`git ${command}`, { encoding: "utf-8" }).trim();
  } catch (error) {
    console.error(`Git 命令执行失败: git ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * 从 Markdown 文件中提取标题
 */
function extractTitle(filePath) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    // 文件已删除，从文件名提取
    return path.basename(filePath, path.extname(filePath));
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".md") {
    // 尝试从 frontmatter 提取 title 或 name
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/^(?:title|name):\s*(.+)$/m);
      if (titleMatch) {
        return titleMatch[1].trim().replace(/^["']|["']$/g, "");
      }
    }
    // 尝试从第一个标题提取
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
  } else if (ext === ".json") {
    // JSON 文件使用文件名
    return path.basename(filePath, ".json");
  }

  // 默认使用文件名
  return path.basename(filePath, path.extname(filePath));
}

/**
 * 解析文件路径，获取内容类型
 */
function parseContentPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/content\/(\w+)\//);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * 获取 content 目录的变更
 */
function getContentChanges() {
  // 获取暂存区和工作区的变更
  const stagedOutput = git("diff --cached --name-status");
  const unstagedOutput = git("diff --name-status");
  const untrackedOutput = git("ls-files --others --exclude-standard");

  const changes = new Map();

  // 解析已暂存的变更
  if (stagedOutput) {
    stagedOutput.split("\n").forEach((line) => {
      const [status, ...fileParts] = line.split("\t");
      const filePath = fileParts.join("\t");
      if (filePath.startsWith("content/")) {
        changes.set(filePath, status.charAt(0));
      }
    });
  }

  // 解析未暂存的变更
  if (unstagedOutput) {
    unstagedOutput.split("\n").forEach((line) => {
      const [status, ...fileParts] = line.split("\t");
      const filePath = fileParts.join("\t");
      if (filePath.startsWith("content/") && !changes.has(filePath)) {
        changes.set(filePath, status.charAt(0));
      }
    });
  }

  // 解析未跟踪的文件
  if (untrackedOutput) {
    untrackedOutput.split("\n").forEach((filePath) => {
      if (filePath.startsWith("content/") && !changes.has(filePath)) {
        changes.set(filePath, "A");
      }
    });
  }

  return changes;
}

/**
 * 生成提交信息
 */
function generateCommitMessage(changes) {
  const grouped = {
    A: [],
    M: [],
    D: [],
    R: [],
  };

  changes.forEach((status, filePath) => {
    // 跳过 .gitkeep 文件
    if (filePath.endsWith(".gitkeep")) return;

    const contentType = parseContentPath(filePath);
    if (!contentType) return;

    const title = extractTitle(filePath);
    const typeName = CONTENT_TYPES[contentType] || contentType;

    if (!grouped[status]) {
      grouped[status] = [];
    }
    grouped[status].push(`${typeName}「${title}」`);
  });

  const parts = [];

  if (grouped.A.length > 0) {
    parts.push(`添加 ${grouped.A.join("、")}`);
  }
  if (grouped.M.length > 0) {
    parts.push(`更新 ${grouped.M.join("、")}`);
  }
  if (grouped.D.length > 0) {
    parts.push(`删除 ${grouped.D.join("、")}`);
  }
  if (grouped.R.length > 0) {
    parts.push(`重命名 ${grouped.R.join("、")}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return `content: ${parts.join("，")}`;
}

/**
 * 主函数
 */
function main() {
  console.log("检查 content 目录变更...\n");

  const changes = getContentChanges();

  if (changes.size === 0) {
    console.log("content 目录没有变更。");
    return;
  }

  console.log("检测到以下变更:");
  changes.forEach((status, filePath) => {
    if (!filePath.endsWith(".gitkeep")) {
      const action = ACTION_TYPES[status] || status;
      console.log(`  [${action}] ${filePath}`);
    }
  });
  console.log("");

  const commitMessage = generateCommitMessage(changes);

  if (!commitMessage) {
    console.log("没有需要提交的内容变更。");
    return;
  }

  console.log(`提交信息: ${commitMessage}\n`);

  // 暂存 content 目录的所有变更
  console.log("暂存变更...");
  git("add content/");

  // 提交
  console.log("创建提交...");
  git(`commit -m "${commitMessage}"`);

  // 推送
  console.log("推送到远程...");
  git("push");

  console.log("\n完成！");
}

main();
