import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import {
  readProjectConfig,
  writeProjectConfig,
  isStateDbEnabled,
  normalizeProjectConfig,
} from "./project-config.js";
import { createProjectDir } from "../test/helpers.js";

describe("project-config", () => {
  it("normalizes missing stateDb to true", () => {
    const config = normalizeProjectConfig({
      locale: "en",
      includeDocs: true,
      installedAt: "2026-01-01",
      manifestVersion: 2,
    });
    expect(config?.stateDb).toBe(true);
  });

  it("writes and reads stateDb flag", async () => {
    const dir = await createProjectDir("project-config");
    await writeProjectConfig(dir, {
      locale: "es",
      includeDocs: false,
      stateDb: true,
      manifestVersion: 2,
    });

    const config = await readProjectConfig(dir);
    expect(config?.stateDb).toBe(true);
    expect(await isStateDbEnabled(dir)).toBe(true);

    const raw = await fs.readJson(path.join(dir, ".specflow-config.json"));
    expect(raw.stateDb).toBe(true);
    expect(raw.codegraph).toBeUndefined();
  });
});
