import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { createProjectDir, runCli } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";
import { getCliVersion } from "../lib/version.js";

describe("CLI integration (dist/cli.js)", () => {
  it("init without TTY exits 1", async () => {
    const dir = await createProjectDir("cli-init-no-tty");
    const { exitCode, stderr } = await runCli(["init", "-C", dir]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("interactive terminal");
  });

  it("sync without init exits 1", async () => {
    const dir = await createProjectDir("cli-sync-fail");
    const { exitCode, stderr } = await runCli(["sync", "-C", dir]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("no está instalado");
  });

  it("sync with --yes exits 0 after install", async () => {
    const dir = await createProjectDir("cli-sync-ok");
    await installTestProject(dir);
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    const { exitCode } = await runCli(["sync", "-C", dir, "--yes"]);
    expect(exitCode).toBe(0);
  });

  it("status exits 0 when up to date", async () => {
    const dir = await createProjectDir("cli-status");
    await installTestProject(dir);
    const { exitCode, stdout } = await runCli(["status", "-C", dir]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain(getCliVersion());
  });
});
