import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { getAssetsDir, getPackageRoot } from "./paths.js";

describe("paths", () => {
  it("resolves package root with manifest v2", async () => {
    const root = getPackageRoot();
    const manifest = await fs.readJson(path.join(root, "manifest.json"));
    expect(manifest.manifestVersion).toBe(2);
  });

  it("resolves assets with core and adapters", async () => {
    const assets = getAssetsDir();
    expect(await fs.pathExists(path.join(assets, "core/AGENTS.md"))).toBe(true);
    expect(
      await fs.pathExists(path.join(assets, "adapters/cursor/.cursor/rules/_specflow.mdc"))
    ).toBe(true);
  });
});
