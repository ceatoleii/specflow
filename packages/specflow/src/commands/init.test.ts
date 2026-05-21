import { describe, it, expect, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runInit } from "./init.js";
import { getCliVersion } from "../lib/version.js";
import { readProjectTools } from "../lib/tools-config.js";
import { createProjectDir } from "../test/helpers.js";

describe("runInit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("installs core, docs, tools config with --yes", async () => {
    const dir = await createProjectDir("init-yes");
    await runInit({ cwd: dir, yes: true });

    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".cursor/rules/_specflow.mdc"))
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".agents-docs/architecture.md"))
    ).toBe(true);

    const version = await fs.readJson(path.join(dir, ".specflow-version"));
    expect(version.specflow).toBe(getCliVersion());

    const tools = await readProjectTools(dir);
    expect(tools?.tools).toContain("cursor");
    expect(tools?.tools).toContain("codex");
  });

  it("does not overwrite existing docs with --yes", async () => {
    const dir = await createProjectDir("init-preserve");
    await fs.ensureDir(path.join(dir, ".agents-docs"));
    await fs.writeFile(
      path.join(dir, ".agents-docs/conventions.md"),
      "# USER"
    );
    await runInit({ cwd: dir, yes: true });
    expect(
      await fs.readFile(path.join(dir, ".agents-docs/conventions.md"), "utf-8")
    ).toBe("# USER");
  });

  it("--no-docs skips agents-docs", async () => {
    const dir = await createProjectDir("init-no-docs");
    await runInit({ cwd: dir, yes: true, noDocs: true });
    expect(await fs.pathExists(path.join(dir, ".agents-docs"))).toBe(false);
  });

  it("--dry-run writes nothing", async () => {
    const dir = await createProjectDir("init-dry");
    await runInit({ cwd: dir, yes: true, dryRun: true });
    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(false);
    expect(await fs.pathExists(path.join(dir, ".specflow-version"))).toBe(false);
  });
});
