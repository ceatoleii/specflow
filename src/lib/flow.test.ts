import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { confirmIfFlowActive, isFlowActive } from "./flow.js";
import { createProjectDir } from "../test/helpers.js";

describe("flow", () => {
  it("isFlowActive is false without flag file", async () => {
    const dir = await createProjectDir("flow-inactive");
    expect(await isFlowActive(dir)).toBe(false);
  });

  it("isFlowActive is true when .flow-enabled exists", async () => {
    const dir = await createProjectDir("flow-active");
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    expect(await isFlowActive(dir)).toBe(true);
  });

  it("confirmIfFlowActive allows when inactive", async () => {
    const dir = await createProjectDir("flow-confirm-ok");
    expect(await confirmIfFlowActive(dir, false)).toBe(true);
  });

  it("confirmIfFlowActive blocks when active without --yes", async () => {
    const dir = await createProjectDir("flow-confirm-block");
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    expect(await confirmIfFlowActive(dir, false)).toBe(false);
  });

  it("confirmIfFlowActive allows when active with --yes", async () => {
    const dir = await createProjectDir("flow-confirm-yes");
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    expect(await confirmIfFlowActive(dir, true)).toBe(true);
  });
});
