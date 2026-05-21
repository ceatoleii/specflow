import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runSync } from "./sync.js";
import { getAssetsDir } from "../lib/paths.js";
import { createProjectDir } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";
import { getCliVersion } from "../lib/version.js";
import { readProjectTools } from "../lib/tools-config.js";

describe("runSync", () => {
  it("throws NOT_INSTALLED when project has no version file", async () => {
    const dir = await createProjectDir("sync-not-installed");
    await expect(runSync({ cwd: dir })).rejects.toMatchObject({
      code: "NOT_INSTALLED",
    });
  });

  it("throws FLOW_ACTIVE without --yes", async () => {
    const dir = await createProjectDir("sync-flow-block");
    await installTestProject(dir);
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    await expect(runSync({ cwd: dir })).rejects.toMatchObject({
      code: "FLOW_ACTIVE",
    });
  });

  it("overwrites stale engine files", async () => {
    const dir = await createProjectDir("sync-overwrite");
    await installTestProject(dir);
    const target = path.join(dir, ".agents/rules/orchestrator.md");
    await fs.writeFile(target, "STALE");
    await runSync({ cwd: dir, yes: true });
    const expected = await fs.readFile(
      path.join(getAssetsDir(), "core/.agents/rules/orchestrator.md"),
      "utf-8"
    );
    expect(await fs.readFile(target, "utf-8")).toBe(expected);
  });

  it("does not modify user docs", async () => {
    const dir = await createProjectDir("sync-docs");
    await installTestProject(dir);
    await fs.writeFile(
      path.join(dir, ".agents-docs/verification.md"),
      "# USER"
    );
    await runSync({ cwd: dir });
    expect(
      await fs.readFile(path.join(dir, ".agents-docs/verification.md"), "utf-8")
    ).toBe("# USER");
  });

  it("dry-run does not update version file", async () => {
    const dir = await createProjectDir("sync-dry");
    await installTestProject(dir);
    await fs.writeJson(path.join(dir, ".specflow-version"), {
      specflow: "0.0.1",
      installedAt: "2020-01-01",
      manifestVersion: 1,
    });
    await runSync({ cwd: dir, dryRun: true });
    const version = await fs.readJson(path.join(dir, ".specflow-version"));
    expect(version.specflow).toBe("0.0.1");
  });

  it("updates .specflow-version and tools.json", async () => {
    const dir = await createProjectDir("sync-version");
    await installTestProject(dir);
    await fs.writeJson(path.join(dir, ".specflow-version"), {
      specflow: "0.0.1",
      installedAt: "2020-01-01",
      manifestVersion: 1,
    });
    await runSync({ cwd: dir });
    const version = await fs.readJson(path.join(dir, ".specflow-version"));
    expect(version.specflow).toBe(getCliVersion());
    const tools = await readProjectTools(dir);
    expect(tools?.manifestVersion).toBe(2);
  });
});
