import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import * as clack from "@clack/prompts";
import { runLinearSetup } from "./linear.js";
import { readLinearConfig } from "../lib/linear-config.js";
import { createProjectDir } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";
import { InitCancelledError } from "../lib/init-cancelled.js";
import { LINEAR_CONFIG_FILE } from "../lib/paths.js";

vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clack/prompts")>();
  return {
    ...actual,
    intro: vi.fn(),
    outro: vi.fn(),
    confirm: vi.fn(),
    text: vi.fn(),
    isCancel: vi.fn((value: unknown) => value === Symbol.for("cancel")),
  };
});

function mockLinearWizard(options: {
  enabled?: boolean;
  team?: string;
  states?: string[];
}) {
  const {
    enabled = true,
    team = "",
    states = ["", "", "", ""],
  } = options;

  vi.mocked(clack.confirm).mockResolvedValueOnce(enabled);
  if (!enabled) return;

  vi.mocked(clack.text)
    .mockResolvedValueOnce(team)
    .mockResolvedValueOnce(states[0])
    .mockResolvedValueOnce(states[1])
    .mockResolvedValueOnce(states[2])
    .mockResolvedValueOnce(states[3]);
}

describe("runLinearSetup", () => {
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
  const cancelSymbol = Symbol.for("cancel");

  beforeEach(() => {
    Object.defineProperty(process.stdin, "isTTY", {
      value: true,
      configurable: true,
    });
    vi.mocked(clack.intro).mockReset();
    vi.mocked(clack.outro).mockReset();
    vi.mocked(clack.confirm).mockReset();
    vi.mocked(clack.text).mockReset();
  });

  afterEach(() => {
    if (ttyDescriptor) {
      Object.defineProperty(process.stdin, "isTTY", ttyDescriptor);
    }
    vi.restoreAllMocks();
  });

  it("throws NO_TTY when stdin is not interactive", async () => {
    const dir = await createProjectDir("linear-no-tty");
    Object.defineProperty(process.stdin, "isTTY", {
      value: false,
      configurable: true,
    });

    await expect(runLinearSetup({ cwd: dir })).rejects.toMatchObject({
      code: "NO_TTY",
    });
  });

  it("writes enabled config with --enable", async () => {
    const dir = await createProjectDir("linear-enable");
    await installTestProject(dir, { includeDocs: false, tools: ["cursor"] });

    await runLinearSetup({ cwd: dir, enable: true });

    const config = await readLinearConfig(dir);
    expect(config?.enabled).toBe(true);
    expect(config?.states.onApprove).toBe("In Progress");
    expect(clack.outro).toHaveBeenCalled();
  });

  it("writes disabled config with --disable", async () => {
    const dir = await createProjectDir("linear-disable");
    await installTestProject(dir, { includeDocs: false, tools: ["cursor"] });
    await fs.writeJson(path.join(dir, LINEAR_CONFIG_FILE), {
      enabled: true,
      states: {
        onRefiningComplete: "Todo",
        onApprove: "In Progress",
        onReviewPass: "Done",
        onReviewFail: "In Progress",
      },
    });

    await runLinearSetup({ cwd: dir, disable: true });

    const config = await readLinearConfig(dir);
    expect(config?.enabled).toBe(false);
  });

  it("runs interactive wizard with custom states", async () => {
    const dir = await createProjectDir("linear-wizard");
    await installTestProject(dir, {
      includeDocs: false,
      tools: ["cursor"],
      locale: "es",
    });

    mockLinearWizard({
      enabled: true,
      team: "  Platform  ",
      states: ["Backlog", "Started", "Shipped", "Started"],
    });

    await runLinearSetup({ cwd: dir });

    const config = await readLinearConfig(dir);
    expect(config?.enabled).toBe(true);
    expect(config?.team).toBe("Platform");
    expect(config?.states).toEqual({
      onRefiningComplete: "Backlog",
      onApprove: "Started",
      onReviewPass: "Shipped",
      onReviewFail: "Started",
    });
    expect(clack.intro).toHaveBeenCalled();
  });

  it("interactive wizard can disable Linear", async () => {
    const dir = await createProjectDir("linear-wizard-off");
    await installTestProject(dir, { includeDocs: false, tools: ["cursor"] });

    mockLinearWizard({ enabled: false });

    await runLinearSetup({ cwd: dir });

    const config = await readLinearConfig(dir);
    expect(config?.enabled).toBe(false);
  });

  it("throws InitCancelledError when user cancels", async () => {
    const dir = await createProjectDir("linear-cancel");
    await installTestProject(dir, { includeDocs: false, tools: ["cursor"] });

    vi.mocked(clack.confirm).mockResolvedValueOnce(cancelSymbol);

    await expect(runLinearSetup({ cwd: dir })).rejects.toBeInstanceOf(
      InitCancelledError
    );
  });
});
