import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import {
  readProjectConfig,
  writeProjectConfig,
  normalizeProjectConfig,
} from "./project-config.js";
import { createProjectDir } from "../test/helpers.js";

describe("project-config", () => {
  it("normalizes partial config", () => {
    const config = normalizeProjectConfig({
      locale: "en",
      includeDocs: true,
      installedAt: "2026-01-01",
      manifestVersion: 2,
    });
    expect(config?.locale).toBe("en");
    expect(config?.includeDocs).toBe(true);
  });

  it("writes and reads project config", async () => {
    const dir = await createProjectDir("project-config");
    await writeProjectConfig(dir, {
      locale: "es",
      includeDocs: false,
      manifestVersion: 2,
    });

    const config = await readProjectConfig(dir);
    expect(config?.locale).toBe("es");
    expect(config?.includeDocs).toBe(false);

    const raw = await fs.readJson(path.join(dir, ".specflow-config.json"));
    expect(raw.locale).toBe("es");
    expect(raw.stateDb).toBeUndefined();
  });
});
