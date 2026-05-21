import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { createProjectDir, runCli } from "../test/helpers.js";
import { getCliVersion } from "../lib/version.js";
describe("CLI integration (dist/cli.js)", () => {
  it("init --yes exits 0 and installs project", async () => {
    const dir = await createProjectDir("cli-init");
    const { exitCode } = await runCli(["init", "-C", dir, "--yes"]);
    expect(exitCode).toBe(0);
    expect(await fs.pathExists(path.join(dir, ".specflow-version"))).toBe(true);
    expect(await fs.pathExists(path.join(dir, ".specflow-tools.json"))).toBe(true);
  });

  it("sync without init exits 1", async () => {
    const dir = await createProjectDir("cli-sync-fail");
    const { exitCode, stderr } = await runCli(["sync", "-C", dir]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("no está instalado");
  });

  it("sync with --yes exits 0 after init", async () => {
    const dir = await createProjectDir("cli-sync-ok");
    await runCli(["init", "-C", dir, "--yes"]);
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    const { exitCode } = await runCli(["sync", "-C", dir, "--yes"]);
    expect(exitCode).toBe(0);
  });

  it("status exits 0 when up to date", async () => {
    const dir = await createProjectDir("cli-status");
    await runCli(["init", "-C", dir, "--yes"]);
    const { exitCode, stdout } = await runCli(["status", "-C", dir]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain(getCliVersion());
  });

  it("init --dry-run exits 0 without writing", async () => {
    const dir = await createProjectDir("cli-dry");
    const { exitCode } = await runCli(["init", "-C", dir, "--yes", "--dry-run"]);
    expect(exitCode).toBe(0);
    expect(await fs.pathExists(path.join(dir, ".specflow-version"))).toBe(false);
  });
});
