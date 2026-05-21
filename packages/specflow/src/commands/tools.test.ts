import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runToolsList, runToolsAdd, runToolsRemove } from "./tools.js";
import { readProjectTools } from "../lib/tools-config.js";
import { createProjectDir } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";

describe("tools", () => {
  it("throws NOT_INSTALLED for list", async () => {
    const dir = await createProjectDir("tools-no-init");
    await expect(runToolsList({ cwd: dir })).rejects.toMatchObject({
      code: "NOT_INSTALLED",
    });
  });

  it("list shows installed adapters", async () => {
    const dir = await createProjectDir("tools-list");
    await installTestProject(dir, { includeDocs: false });
    await expect(runToolsList({ cwd: dir })).resolves.toBeUndefined();
  });

  it("add installs github-copilot adapter", async () => {
    const dir = await createProjectDir("tools-add");
    await installTestProject(dir, { includeDocs: false });

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
    await installTestProject(dir);

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
