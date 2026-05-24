import { describe, it, expect, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runStatus } from "./status.js";
import { createProjectDir } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";

describe("runStatus", () => {
  it("returns not_installed when missing version file", async () => {
    const dir = await createProjectDir("status-missing");
    const result = await runStatus({ cwd: dir });
    expect(result).toBe("not_installed");
  });

  it("returns ok when versions match", async () => {
    const dir = await createProjectDir("status-ok");
    await installTestProject(dir);
    const result = await runStatus({ cwd: dir });
    expect(result).toBe("ok");
  });

  it("returns outdated when project version is older", async () => {
    const dir = await createProjectDir("status-outdated");
    await installTestProject(dir);
    await fs.writeJson(path.join(dir, ".specflow-version"), {
      specflow: "0.0.1",
      installedAt: "2020-01-01",
      manifestVersion: 1,
    });
    const result = await runStatus({ cwd: dir });
    expect(result).toBe("outdated");
  });

  it("returns cli_older when project version is newer", async () => {
    const dir = await createProjectDir("status-cli-older");
    await installTestProject(dir);
    await fs.writeJson(path.join(dir, ".specflow-version"), {
      specflow: "99.99.99",
      installedAt: "2020-01-01",
      manifestVersion: 1,
    });
    const result = await runStatus({ cwd: dir });
    expect(result).toBe("cli_older");
  });

  it("reports flow active state in output", async () => {
    const dir = await createProjectDir("status-flow");
    await installTestProject(dir);
    await fs.ensureDir(path.join(dir, ".agents-state"));
    await fs.writeFile(path.join(dir, ".agents-state/.flow-enabled"), "");
    const logCalls: string[] = [];
    const log = vi.spyOn(console, "log").mockImplementation((msg) => {
      logCalls.push(String(msg));
    });
    await runStatus({ cwd: dir });
    expect(logCalls.some((l) => l.includes("activo"))).toBe(true);
    log.mockRestore();
  });
});
