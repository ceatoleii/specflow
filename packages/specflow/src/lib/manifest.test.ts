import { describe, it, expect } from "vitest";
import { loadManifest, getStableAdapterIds } from "./manifest.js";

describe("loadManifest", () => {
  it("loads manifest v2 with core and adapters", async () => {
    const manifest = await loadManifest();
    expect(manifest.manifestVersion).toBe(2);
    expect(manifest.core.static.length).toBeGreaterThan(0);
    expect(manifest.adapters.cursor.tier).toBe("stable");
    expect(manifest.adapters.windsurf.tier).toBe("experimental");
    expect(manifest.gitignoreEntries).toContain(".agents-state/");
  });

  it("throws on unsupported manifest version", async () => {
    const { loadManifest } = await import("./manifest.js");
    const fs = await import("fs-extra");
    const path = await import("node:path");
    const { getPackageRoot } = await import("./paths.js");
    const manifestPath = path.join(getPackageRoot(), "manifest.json");
    const original = await fs.readJson(manifestPath);
    try {
      await fs.writeJson(manifestPath, { ...original, manifestVersion: 1 });
      await expect(loadManifest()).rejects.toThrow("Unsupported manifest");
    } finally {
      await fs.writeJson(manifestPath, original);
    }
  });

  it("lists stable adapters", async () => {
    const manifest = await loadManifest();
    const stable = getStableAdapterIds(manifest);
    expect(stable).toContain("cursor");
    expect(stable).toContain("codex");
    expect(stable).not.toContain("windsurf");
  });
});
