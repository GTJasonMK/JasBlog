import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createNodeBootstrap } from "../../scripts/node-bootstrap.mjs";
import { pickAvailablePort, readCliPort } from "../../scripts/port-utils.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const bootstrap = createNodeBootstrap({
  repoRoot: path.resolve(scriptDir, ".."),
  knownNodeBins: {
    next: "node_modules/next/dist/bin/next",
  },
});

const forwardedArgs = process.argv.slice(2);
await bootstrap.ensureNodeDependencies([
  "node_modules/next/dist/bin/next",
]);

const explicitPort = readCliPort(forwardedArgs);
const selectedPort = explicitPort ?? await pickAvailablePort({
  basePort: Number(process.env.PORT) || 3000,
});
const finalArgs = ["dev", ...forwardedArgs];

if (!explicitPort) {
  finalArgs.push("--port", String(selectedPort));
  console.log(`INFO: Starting dev server on http://localhost:${selectedPort}/`);
}

const { cmd, args } = bootstrap.resolveLocalBinCommand("next");
const child = spawn(cmd, [...args, ...finalArgs], {
  cwd: bootstrap.repoRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
