import { describe, it, expect } from "vitest";
import { loadManifest } from "./manifest.js";

describe("loadManifest", () => {
  it("loads static, scaffold, and gitignore entries", async () => {
    const manifest = await loadManifest();
    expect(manifest.static.length).toBeGreaterThan(0);
    expect(manifest.scaffold.length).toBeGreaterThan(0);
    expect(manifest.gitignoreEntries).toContain(".agents-state/");
    expect(manifest.manifestVersion).toBe(1);
  });
});
