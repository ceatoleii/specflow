import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import {
  detectLegacyTools,
  readProjectTools,
  writeProjectTools,
  resolveInstalledTools,
} from "./tools-config.js";
import { assertProjectInstalled, NOT_INSTALLED_MESSAGE } from "./project-guard.js";
import { SpecflowCliError } from "../errors.js";
import { createProjectDir } from "../test/helpers.js";
import { writeProjectVersion } from "./version.js";

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

  it("resolveInstalledTools prefers config over legacy markers", async () => {
    const dir = await createProjectDir("resolve-config");
    await fs.ensureDir(path.join(dir, ".cursor/rules"));
    await fs.writeFile(path.join(dir, ".cursor/rules/_specflow.mdc"), "");
    await writeProjectTools(dir, ["codex"], 2);

    expect(await resolveInstalledTools(dir)).toEqual(["codex"]);
  });

  it("resolveInstalledTools falls back to legacy markers", async () => {
    const dir = await createProjectDir("resolve-legacy");
    await fs.ensureDir(path.join(dir, ".github"));
    await fs.writeFile(
      path.join(dir, ".github/copilot-instructions.md"),
      "SpecFlow"
    );

    expect(await resolveInstalledTools(dir)).toEqual(["github-copilot"]);
  });

  it("resolveInstalledTools returns empty when nothing installed", async () => {
    const dir = await createProjectDir("resolve-empty");
    expect(await resolveInstalledTools(dir)).toEqual([]);
  });
});

describe("project-guard", () => {
  it("assertProjectInstalled throws NOT_INSTALLED when missing version", async () => {
    const dir = await createProjectDir("not-installed");

    await expect(assertProjectInstalled(dir)).rejects.toMatchObject({
      code: "NOT_INSTALLED",
      message: NOT_INSTALLED_MESSAGE,
    } satisfies Partial<SpecflowCliError>);
  });

  it("assertProjectInstalled passes when version exists", async () => {
    const dir = await createProjectDir("installed");
    await writeProjectVersion(dir, "1.0.0", 2);

    await expect(assertProjectInstalled(dir)).resolves.toBeUndefined();
  });
});
