import { describe, it, expect, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { loadManifest } from "./manifest.js";
import {
  copyFiles,
  copyScaffold,
  copyStatic,
  mergeResults,
  printCopyResult,
} from "./copy.js";
import { getAssetsDir } from "./paths.js";
import { createProjectDir } from "../test/helpers.js";

describe("copy", () => {
  it("copyStatic creates engine files", async () => {
    const dir = await createProjectDir("copy-static");
    const manifest = await loadManifest();
    const result = await copyStatic(dir, manifest, { dryRun: false });
    expect(result.created.length).toBeGreaterThan(0);
    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(true);
  });

  it("copyScaffold skips existing files", async () => {
    const dir = await createProjectDir("copy-scaffold-skip");
    await fs.ensureDir(path.join(dir, ".agents-docs"));
    await fs.writeFile(
      path.join(dir, ".agents-docs/architecture.md"),
      "CUSTOM"
    );
    const manifest = await loadManifest();
    const result = await copyScaffold(dir, manifest, { dryRun: false });
    expect(result.skipped).toContain(".agents-docs/architecture.md");
    expect(
      await fs.readFile(path.join(dir, ".agents-docs/architecture.md"), "utf-8")
    ).toBe("CUSTOM");
  });

  it("copyStatic dry-run does not write files", async () => {
    const dir = await createProjectDir("copy-dry");
    const manifest = await loadManifest();
    await copyStatic(dir, manifest, { dryRun: true });
    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(false);
  });

  it("copyStatic overwrites existing engine file", async () => {
    const dir = await createProjectDir("copy-overwrite");
    const manifest = await loadManifest();
    await copyStatic(dir, manifest, { dryRun: false });
    const target = path.join(dir, ".agents/rules/orchestrator.md");
    await fs.writeFile(target, "STALE CONTENT");
    const result = await copyStatic(dir, manifest, { dryRun: false });
    expect(result.updated).toContain(".agents/rules/orchestrator.md");
    const asset = await fs.readFile(
      path.join(getAssetsDir(), ".agents/rules/orchestrator.md"),
      "utf-8"
    );
    expect(await fs.readFile(target, "utf-8")).toBe(asset);
  });

  it("mergeResults combines arrays", () => {
    const merged = mergeResults(
      { created: ["a"], updated: [], skipped: [] },
      { created: [], updated: ["b"], skipped: ["c"] }
    );
    expect(merged).toEqual({
      created: ["a"],
      updated: ["b"],
      skipped: ["c"],
    });
  });

  it("printCopyResult logs summary", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    printCopyResult("Test", { created: ["x"], updated: [], skipped: [] }, false);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
