import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runInit } from "./init.js";
import { runToolsList, runToolsAdd, runToolsRemove } from "./tools.js";
import { readProjectTools } from "../lib/tools-config.js";
import { createProjectDir } from "../test/helpers.js";

describe("tools", () => {
  it("throws NOT_INSTALLED for list", async () => {
    const dir = await createProjectDir("tools-no-init");
    await expect(runToolsList({ cwd: dir })).rejects.toMatchObject({
      code: "NOT_INSTALLED",
    });
  });

  it("list shows installed adapters", async () => {
    const dir = await createProjectDir("tools-list");
    await runInit({ cwd: dir, yes: true, noDocs: true });
    await expect(runToolsList({ cwd: dir })).resolves.toBeUndefined();
  });

  it("add installs github-copilot adapter", async () => {
    const dir = await createProjectDir("tools-add");
    await runInit({ cwd: dir, yes: true, noDocs: true });

    await runToolsAdd({
      cwd: dir,
      toolIds: ["github-copilot"],
    });

    expect(
      await fs.pathExists(path.join(dir, ".github/copilot-instructions.md"))
    ).toBe(true);
    const config = await readProjectTools(dir);
    expect(config?.tools).toContain("github-copilot");
  });

  it("remove deletes adapter files", async () => {
    const dir = await createProjectDir("tools-remove");
    await runInit({ cwd: dir, yes: true });

    await runToolsRemove({
      cwd: dir,
      toolIds: ["cursor"],
    });

    expect(
      await fs.pathExists(path.join(dir, ".cursor/rules/_specflow.mdc"))
    ).toBe(false);
    const config = await readProjectTools(dir);
    expect(config?.tools).not.toContain("cursor");
  });
});
