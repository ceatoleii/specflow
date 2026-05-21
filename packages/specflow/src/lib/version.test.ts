import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import {
  getCliVersion,
  readProjectVersion,
  writeProjectVersion,
} from "./version.js";
import { createProjectDir } from "../test/helpers.js";

describe("version", () => {
  it("getCliVersion returns package version", () => {
    expect(getCliVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("readProjectVersion returns null when missing", async () => {
    const dir = await createProjectDir("no-version");
    expect(await readProjectVersion(dir)).toBeNull();
  });

  it("writeProjectVersion round-trips", async () => {
    const dir = await createProjectDir("version-roundtrip");
    await writeProjectVersion(dir, "9.9.9", 1);
    const read = await readProjectVersion(dir);
    expect(read?.specflow).toBe("9.9.9");
    expect(read?.manifestVersion).toBe(1);
    expect(read?.installedAt).toBeTruthy();
    expect(await fs.pathExists(path.join(dir, ".specflow-version"))).toBe(true);
  });
});
