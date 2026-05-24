import { describe, it, expect, afterEach } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runDoctor } from "./doctor.js";
import { installTestProject } from "../test/install-fixture.js";
import { createProjectDir } from "../test/helpers.js";
import { FLOW_FLAG } from "../lib/paths.js";

describe("runDoctor", () => {
  const dirs: string[] = [];

  afterEach(async () => {
    for (const d of dirs) {
      await fs.remove(d).catch(() => {});
    }
    dirs.length = 0;
  });

  it("reports error when not installed", async () => {
    const dir = await createProjectDir("doctor-not-installed");
    dirs.push(dir);
    const report = await runDoctor({ cwd: dir, json: true });
    expect(report.hasErrors).toBe(true);
    expect(report.checks.some((c) => c.id === "installed" && !c.passed)).toBe(
      true
    );
  });

  it("passes static checks on installed project", async () => {
    const dir = await createProjectDir("doctor-ok");
    dirs.push(dir);
    await installTestProject(dir, { includeDocs: true });
    await fs.writeFile(path.join(dir, ".gitignore"), ".agents-state/\n");

    const report = await runDoctor({ cwd: dir, json: true });
    expect(report.hasErrors).toBe(false);
    expect(report.checks.some((c) => c.id === "plan-template" && c.passed)).toBe(
      true
    );
  });

  it("errors when flow active without phase.md", async () => {
    const dir = await createProjectDir("doctor-flow");
    dirs.push(dir);
    await installTestProject(dir, { includeDocs: false });
    await fs.ensureDir(path.join(dir, ".agents-state/current"));
    await fs.writeFile(path.join(dir, FLOW_FLAG), "");

    const report = await runDoctor({ cwd: dir, json: true });
    expect(report.hasErrors).toBe(true);
    expect(report.checks.some((c) => c.id === "phase" && !c.passed)).toBe(true);
  });

  it("warns when implementing phase missing plan.md", async () => {
    const dir = await createProjectDir("doctor-impl");
    dirs.push(dir);
    await installTestProject(dir, { includeDocs: false });
    const current = path.join(dir, ".agents-state/current");
    await fs.ensureDir(current);
    await fs.writeFile(path.join(dir, FLOW_FLAG), "");
    await fs.writeFile(path.join(current, "phase.md"), "implementing");
    await fs.writeFile(path.join(current, "task.md"), "# Task: x");

    const report = await runDoctor({ cwd: dir, json: true });
    expect(report.hasErrors).toBe(true);
    expect(
      report.checks.some((c) => c.id === "artifact-plan" && !c.passed)
    ).toBe(true);
  });
});
