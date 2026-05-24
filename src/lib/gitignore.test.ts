import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { ensureGitignoreEntries } from "./gitignore.js";
import { createProjectDir } from "../test/helpers.js";

describe("ensureGitignoreEntries", () => {
  it("creates .gitignore with SpecFlow block", async () => {
    const dir = await createProjectDir("gitignore-new");
    const added = await ensureGitignoreEntries(dir, [".agents-state/"]);
    expect(added).toEqual([".agents-state/"]);
    const content = await fs.readFile(path.join(dir, ".gitignore"), "utf-8");
    expect(content).toContain("# SpecFlow");
    expect(content).toContain(".agents-state/");
  });

  it("does not duplicate existing entries", async () => {
    const dir = await createProjectDir("gitignore-dup");
    await fs.writeFile(path.join(dir, ".gitignore"), ".agents-state/\n");
    const added = await ensureGitignoreEntries(dir, [".agents-state/"]);
    expect(added).toEqual([]);
  });

  it("appends to existing .gitignore", async () => {
    const dir = await createProjectDir("gitignore-append");
    await fs.writeFile(path.join(dir, ".gitignore"), "node_modules/\n");
    await ensureGitignoreEntries(dir, [".agents-state/"]);
    const content = await fs.readFile(path.join(dir, ".gitignore"), "utf-8");
    expect(content).toContain("node_modules/");
    expect(content).toContain(".agents-state/");
  });
});
