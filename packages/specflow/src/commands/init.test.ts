import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import * as clack from "@clack/prompts";
import { runInit } from "./init.js";
import { getCliVersion } from "../lib/version.js";
import { readProjectTools } from "../lib/tools-config.js";
import { readProjectConfig } from "../lib/project-config.js";
import { createProjectDir } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";

vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clack/prompts")>();
  return {
    ...actual,
    intro: vi.fn(),
    outro: vi.fn(),
    note: vi.fn(),
    cancel: vi.fn(),
    log: { message: vi.fn() },
    spinner: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
    })),
    select: vi.fn(),
    multiselect: vi.fn(),
    confirm: vi.fn(),
  };
});

function mockInitWizard(locale: "es" | "en" = "en") {
  vi.mocked(clack.select)
    .mockResolvedValueOnce(locale)
    .mockResolvedValueOnce("yes");
  vi.mocked(clack.confirm)
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(false)
    .mockResolvedValueOnce(true);
  vi.mocked(clack.multiselect).mockResolvedValueOnce(["cursor", "codex"]);
}

describe("runInit", () => {
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");

  beforeEach(() => {
    Object.defineProperty(process.stdin, "isTTY", {
      value: true,
      configurable: true,
    });
    vi.mocked(clack.intro).mockReset();
    vi.mocked(clack.select).mockReset();
    vi.mocked(clack.confirm).mockReset();
    vi.mocked(clack.multiselect).mockReset();
    vi.mocked(clack.outro).mockReset();
    vi.mocked(clack.spinner).mockReset();
    vi.mocked(clack.spinner).mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
    });
  });

  afterEach(() => {
    if (ttyDescriptor) {
      Object.defineProperty(process.stdin, "isTTY", ttyDescriptor);
    }
    vi.restoreAllMocks();
  });

  it("installs core, docs, tools config via wizard", async () => {
    const dir = await createProjectDir("init-wizard");
    mockInitWizard("es");

    await runInit({ cwd: dir });

    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".cursor/rules/_specflow.mdc"))
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, ".agents-docs/architecture.md"))
    ).toBe(true);

    const version = await fs.readJson(path.join(dir, ".specflow-version"));
    expect(version.specflow).toBe(getCliVersion());

    const tools = await readProjectTools(dir);
    expect(tools?.tools).toContain("cursor");
    expect(tools?.tools).toContain("codex");

    const config = await readProjectConfig(dir);
    expect(config?.locale).toBe("es");
    expect(config?.includeDocs).toBe(true);
  });

  it("throws NO_TTY when stdin is not interactive", async () => {
    const dir = await createProjectDir("init-no-tty");
    Object.defineProperty(process.stdin, "isTTY", {
      value: false,
      configurable: true,
    });

    await expect(runInit({ cwd: dir })).rejects.toMatchObject({
      code: "NO_TTY",
    });
  });

  it("does not overwrite existing docs on re-init", async () => {
    const dir = await createProjectDir("init-preserve");
    await fs.ensureDir(path.join(dir, ".agents-docs"));
    await fs.writeFile(
      path.join(dir, ".agents-docs/conventions.md"),
      "# USER"
    );
    mockInitWizard();

    await runInit({ cwd: dir });
    expect(
      await fs.readFile(path.join(dir, ".agents-docs/conventions.md"), "utf-8")
    ).toBe("# USER");
  });

  it("--no-docs skips agents-docs", async () => {
    const dir = await createProjectDir("init-no-docs");
    mockInitWizard();

    await runInit({ cwd: dir, noDocs: true });
    expect(await fs.pathExists(path.join(dir, ".agents-docs"))).toBe(false);
  });

  it("--dry-run writes nothing", async () => {
    const dir = await createProjectDir("init-dry");
    mockInitWizard();

    await runInit({ cwd: dir, dryRun: true });
    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(false);
    expect(await fs.pathExists(path.join(dir, ".specflow-version"))).toBe(false);
  });
});

describe("installTestProject", () => {
  it("seeds a project without the init wizard", async () => {
    const dir = await createProjectDir("fixture");
    await installTestProject(dir, { locale: "en", includeDocs: false });

    expect(await fs.pathExists(path.join(dir, "AGENTS.md"))).toBe(true);
    const config = await readProjectConfig(dir);
    expect(config?.locale).toBe("en");
  });
});