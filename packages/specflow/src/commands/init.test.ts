import { describe, it, expect, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runInit } from "./init.js";
import { getCliVersion } from "../lib/version.js";
import { createProjectDir } from "../test/helpers.js";

describe("runInit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("installs engine, docs scaffold, version, and gitignore", async () => {
    const dir = await createProjectDir("init-full");
    await runInit({ cwd: dir });

    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".agents/rules/orchestrator.md"))
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".agents-docs/architecture.md"))
    ).toBe(true);
    const version = await fs.readJson(path.join(dir, ".specflow-version"));
    expect(version.specflow).toBe(getCliVersion());
    const gitignore = await fs.readFile(path.join(dir, ".gitignore"), "utf-8");
    expect(gitignore).toContain(".agents-state/");
  });

  it("does not overwrite existing docs", async () => {
    const dir = await createProjectDir("init-preserve-docs");
    await fs.ensureDir(path.join(dir, ".agents-docs"));
    await fs.writeFile(
      path.join(dir, ".agents-docs/conventions.md"),
      "# USER"
    );
    await runInit({ cwd: dir });
    expect(
      await fs.readFile(path.join(dir, ".agents-docs/conventions.md"), "utf-8")
    ).toBe("# USER");
  });

  it("--no-docs skips agents-docs", async () => {
    const dir = await createProjectDir("init-no-docs");
    await runInit({ cwd: dir, noDocs: true });
    expect(await fs.pathExists(path.join(dir, ".agents-docs"))).toBe(false);
  });

  it("--dry-run writes nothing", async () => {
    const dir = await createProjectDir("init-dry");
    await runInit({ cwd: dir, dryRun: true });
    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(false);
    expect(await fs.pathExists(path.join(dir, ".specflow-version"))).toBe(false);
  });

  it("warns when already installed", async () => {
    const dir = await createProjectDir("init-twice");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await runInit({ cwd: dir });
    await runInit({ cwd: dir });
    expect(log.mock.calls.some((c) => String(c[0]).includes("ya está instalado"))).toBe(
      true
    );
    log.mockRestore();
  });
});
