import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "..", "cli.js");
const PKG_ROOT = path.resolve(__dirname, "..", "..");
const TMP_ROOT = path.join(PKG_ROOT, ".test-tmp");

let tmpDir: string;

before(async () => {
  tmpDir = path.join(TMP_ROOT, `run-${Date.now()}`);
  await fs.ensureDir(tmpDir);
});

after(async () => {
  await fs.remove(tmpDir);
});

async function run(args: string[], cwd: string) {
  const { stdout, stderr } = await execFileAsync(process.execPath, [CLI, ...args], {
    cwd,
    env: { ...process.env, NODE_ENV: "test" },
  });
  return (stdout + stderr).trim();
}

test("init installs static files and version", async () => {
  const project = path.join(tmpDir, "init-test");
  await fs.ensureDir(project);

  await run(["init", "-C", project], PKG_ROOT);

  assert.ok(await fs.pathExists(path.join(project, "AGENTS.md")));
  assert.ok(await fs.pathExists(path.join(project, ".agents/rules/orchestrator.md")));
  assert.ok(await fs.pathExists(path.join(project, ".cursor/rules/_specflow.mdc")));
  assert.ok(await fs.pathExists(path.join(project, ".specflow-version")));

  const version = await fs.readJson(path.join(project, ".specflow-version"));
  assert.equal(typeof version.specflow, "string");
});

test("init does not overwrite existing docs", async () => {
  const project = path.join(tmpDir, "docs-test");
  await fs.ensureDir(path.join(project, ".agents-docs"));
  await fs.writeFile(
    path.join(project, ".agents-docs/architecture.md"),
    "# CUSTOM"
  );

  await run(["init", "-C", project], PKG_ROOT);

  const content = await fs.readFile(
    path.join(project, ".agents-docs/architecture.md"),
    "utf-8"
  );
  assert.equal(content, "# CUSTOM");
});

test("sync updates static without touching docs", async () => {
  const project = path.join(tmpDir, "sync-test");
  await fs.ensureDir(project);
  await run(["init", "-C", project], PKG_ROOT);

  await fs.writeFile(
    path.join(project, ".agents-docs/conventions.md"),
    "# USER CONVENTIONS"
  );

  await run(["sync", "-C", project, "--yes"], PKG_ROOT);

  const content = await fs.readFile(
    path.join(project, ".agents-docs/conventions.md"),
    "utf-8"
  );
  assert.equal(content, "# USER CONVENTIONS");
});

test("init --no-docs skips agents-docs", async () => {
  const project = path.join(tmpDir, "no-docs-test");
  await fs.ensureDir(project);

  await run(["init", "-C", project, "--no-docs"], PKG_ROOT);

  assert.ok(!(await fs.pathExists(path.join(project, ".agents-docs"))));
});
