#!/usr/bin/env node

/**
 * Detects content changes, creates a commit message, commits, and pushes.
 * Usage: node scripts/auto-commit-content.js
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CONTENT_TYPE_LABELS = {
  notes: "notes",
  diary: "diary",
  projects: "projects",
  roadmaps: "roadmaps",
  graphs: "graphs",
};

const ACTION_LABELS = {
  A: "add",
  M: "update",
  D: "delete",
  R: "rename",
};

function runGit(args, options = {}) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0 && !options.allowFailure) {
    const stderr = (result.stderr || "").trim();
    const command = `git ${args.join(" ")}`;
    throw new Error(`Command failed: ${command}\n${stderr}`);
  }

  return {
    status: result.status || 0,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function normalizeAction(code) {
  if (code === "??") return "A";
  if (code.startsWith("R")) return "R";

  const staged = code.charAt(0);
  const unstaged = code.charAt(1);
  const action = staged !== " " ? staged : unstaged;

  if (action === "A" || action === "M" || action === "D" || action === "R") {
    return action;
  }

  return "M";
}

function parseContentType(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/^content\/([^/]+)\//);
  if (!match) return null;
  return match[1];
}

function extractTitle(filePath) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    return path.basename(filePath, path.extname(filePath));
  }

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    return path.basename(filePath.replace(/[\\/]+$/, ""));
  }

  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(fullPath, "utf8");

  if (ext === ".md") {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (frontmatterMatch) {
      const titleMatch = frontmatterMatch[1].match(/^(?:title|name):\s*(.+)$/im);
      if (titleMatch) {
        return titleMatch[1].trim().replace(/^["']|["']$/g, "");
      }
    }

    const headingMatch = content.match(/(?:^|\r?\n)#\s+(.+)/);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
  }

  return path.basename(filePath, ext);
}

function getContentChanges() {
  const output = runGit([
    "status",
    "--porcelain=1",
    "--untracked-files=normal",
    "--",
    "content/",
  ]).stdout;

  const changes = [];
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  for (const line of lines) {
    if (line.length < 4) continue;

    const code = line.slice(0, 2);
    let filePath = line.slice(3).trim();

    if (code.startsWith("R") && filePath.includes(" -> ")) {
      filePath = filePath.split(" -> ").pop().trim();
    }

    if (!filePath.startsWith("content/")) {
      continue;
    }
    if (filePath.endsWith("/")) {
      continue;
    }

    changes.push({
      action: normalizeAction(code),
      filePath,
    });
  }

  return changes;
}

function generateCommitMessage(changes) {
  const grouped = {
    A: [],
    M: [],
    D: [],
    R: [],
  };

  for (const change of changes) {
    if (change.filePath.endsWith(".gitkeep")) continue;

    const contentType = parseContentType(change.filePath);
    if (!contentType) continue;

    const typeLabel = CONTENT_TYPE_LABELS[contentType] || contentType;
    const title = extractTitle(change.filePath);
    grouped[change.action].push(`${typeLabel}: ${title}`);
  }

  const segments = [];
  for (const action of ["A", "M", "D", "R"]) {
    const entries = grouped[action];
    if (!entries.length) continue;
    segments.push(`${ACTION_LABELS[action]} ${entries.join(", ")}`);
  }

  if (!segments.length) return null;
  return `content: ${segments.join("; ")}`;
}

function main() {
  console.log("Checking content changes...\n");

  let changes;
  try {
    changes = getContentChanges();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  if (!changes.length) {
    console.log("No content changes found.");
    return;
  }

  const commitMessage = generateCommitMessage(changes);
  if (!commitMessage) {
    console.log("No committable content changes (only .gitkeep or unsupported files).");
    return;
  }

  console.log("Detected changes:");
  for (const change of changes) {
    if (!change.filePath.endsWith(".gitkeep")) {
      console.log(`  [${change.action}] ${change.filePath}`);
    }
  }
  console.log(`\nCommit message: ${commitMessage}\n`);

  try {
    runGit(["add", "content/"]);
    runGit(["commit", "-m", commitMessage]);
    runGit(["push"]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  console.log("Done.");
}

main();
