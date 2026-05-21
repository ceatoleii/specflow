import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import {
  detectLegacyTools,
  readProjectTools,
  writeProjectTools,
} from "./tools-config.js";
import { createProjectDir } from "../test/helpers.js";

describe("tools-config", () => {
  it("detectLegacyTools finds cursor and claude", async () => {
    const dir = await createProjectDir("legacy-detect");
    await fs.ensureDir(path.join(dir, ".cursor/rules"));
    await fs.writeFile(path.join(dir, ".cursor/rules/_specflow.mdc"), "");
    await fs.writeFile(
      path.join(dir, "CLAUDE.md"),
      "# SpecFlow\norchestrator"
    );
    const tools = await detectLegacyTools(dir);
    expect(tools).toContain("cursor");
    expect(tools).toContain("claude-code");
  });

  it("writeProjectTools deduplicates and sorts", async () => {
    const dir = await createProjectDir("tools-write");
    await writeProjectTools(dir, ["cursor", "cursor", "codex"], 2);
    const read = await readProjectTools(dir);
    expect(read?.tools).toEqual(["codex", "cursor"]);
  });
});
