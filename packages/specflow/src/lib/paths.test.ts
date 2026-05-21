import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { getAssetsDir, getPackageRoot } from "./paths.js";

describe("paths", () => {
  it("resolves package root with assets and manifest", async () => {
    const root = getPackageRoot();
    expect(await fs.pathExists(path.join(root, "manifest.json"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "package.json"))).toBe(true);
  });

  it("resolves assets dir with AGENTS.md", async () => {
    const assets = getAssetsDir();
    expect(await fs.pathExists(path.join(assets, "AGENTS.md"))).toBe(true);
  });
});
