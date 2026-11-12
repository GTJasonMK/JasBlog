import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createEmptyGraph } from "@jas/graph-core";
import { parseGraphDocument } from "@jas/content-core/graph-document";
import { importGraph } from "./import-graph.js";

test("graph importer preserves GT metadata and never overwrites existing creative content", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "jas-graph-import-"));
  try {
    const inputPath = path.join(directory, "input.json");
    const graph = { ...createEmptyGraph("code.v1"), meta: { ...createEmptyGraph("code.v1").meta, sourceRef: "src/main.ts", adapterId: "code.ts.import.v1", custom: "retained" } };
    writeFileSync(inputPath, JSON.stringify(graph));
    const args = { inputPath, graphsDirectory: directory, name: "audit", description: "fixture", date: "2026-04-03" };
    const result = await importGraph(args);
    const saved = readFileSync(result.outputPath, "utf8");
    assert.deepEqual(parseGraphDocument(saved).graphData, graph);
    await assert.rejects(importGraph(args), /EEXIST/);
    assert.equal(readFileSync(result.outputPath, "utf8"), saved);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
