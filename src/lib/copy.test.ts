import { describe, it, expect, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { loadManifest } from "./manifest.js";
import {
  copyCoreStatic,
  copyCoreScaffold,
  copyAdapter,
  mergeResults,
  printCopyResult,
} from "./copy.js";
import { getAssetsDir } from "./paths.js";
import { createProjectDir } from "../test/helpers.js";

describe("copy", () => {
  it("copyCoreStatic maps core/ to project root", async () => {
    const dir = await createProjectDir("copy-core");
    const manifest = await loadManifest();
    const result = await copyCoreStatic(dir, manifest.core.static, {
      dryRun: false,
    });
    expect(result.created.length).toBeGreaterThan(0);
    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".agents/rules/orchestrator.md"))
    ).toBe(true);
  });

  it("copyCoreScaffold skips existing docs", async () => {
    const dir = await createProjectDir("copy-scaffold");
    await fs.ensureDir(path.join(dir, ".agents-docs"));
    await fs.writeFile(
      path.join(dir, ".agents-docs/architecture.md"),
      "CUSTOM"
    );
    const manifest = await loadManifest();
    const result = await copyCoreScaffold(dir, manifest.core.scaffold, {
      dryRun: false,
    });
    expect(result.skipped).toContain(".agents-docs/architecture.md");
    expect(
      await fs.readFile(path.join(dir, ".agents-docs/architecture.md"), "utf-8")
    ).toBe("CUSTOM");
  });

  it("copyAdapter installs cursor mdc", async () => {
    const dir = await createProjectDir("copy-adapter");
    const manifest = await loadManifest();
    await copyAdapter(dir, "cursor", manifest.adapters.cursor.files, {
      dryRun: false,
    });
    expect(
      await fs.pathExists(path.join(dir, ".cursor/rules/_specflow.mdc"))
    ).toBe(true);
  });

  it("copyCoreStatic overwrites stale files", async () => {
    const dir = await createProjectDir("copy-overwrite");
    const manifest = await loadManifest();
    await copyCoreStatic(dir, manifest.core.static, { dryRun: false });
    const target = path.join(dir, ".agents/rules/orchestrator.md");
    await fs.writeFile(target, "STALE");
    await copyCoreStatic(dir, manifest.core.static, { dryRun: false });
    const expected = await fs.readFile(
      path.join(getAssetsDir(), "core/.agents/rules/orchestrator.md"),
      "utf-8"
    );
    expect(await fs.readFile(target, "utf-8")).toBe(expected);
  });

  it("printCopyResult logs summary", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    printCopyResult("Test", { created: ["x"], updated: [], skipped: [] }, false);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it("mergeResults combines arrays", () => {
    const merged = mergeResults(
      { created: ["a"], updated: [], skipped: [] },
      { created: [], updated: ["b"], skipped: ["c"] }
    );
    expect(merged.created).toEqual(["a"]);
    expect(merged.updated).toEqual(["b"]);
  });
});
