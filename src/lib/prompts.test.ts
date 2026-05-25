import { describe, it, expect, vi, beforeEach } from "vitest";
import * as clack from "@clack/prompts";
import * as inquirer from "@inquirer/prompts";
import {
  runInitPrompts,
  runToolsAddPrompts,
  runToolsRemovePrompts,
} from "./prompts.js";
import { InitCancelledError } from "./init-cancelled.js";
import { createProjectDir } from "../test/helpers.js";

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  cancel: vi.fn(),
  log: { message: vi.fn() },
  isCancel: vi.fn((value: unknown) => value === Symbol.for("cancel")),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock("@inquirer/prompts", () => ({
  confirm: vi.fn(),
  checkbox: vi.fn(),
  select: vi.fn(),
}));

const cancelSymbol = Symbol.for("cancel");

function mockWizardFlow(
  overrides: {
    locale?: "es" | "en";
    installCursor?: boolean;
    includeDocs?: boolean;
    proceed?: boolean;
    linearEnabled?: boolean;
    confirmInstall?: boolean;
  } = {}
) {
  const {
    locale = "en",
    installCursor = true,
    includeDocs = true,
    proceed = true,
    linearEnabled = false,
    confirmInstall = true,
  } = overrides;

  vi.mocked(clack.select)
    .mockResolvedValueOnce(locale)
    .mockResolvedValueOnce(includeDocs ? "yes" : "no");
  vi.mocked(clack.confirm)
    .mockResolvedValueOnce(proceed)
    .mockResolvedValueOnce(installCursor)
    .mockResolvedValueOnce(linearEnabled)
    .mockResolvedValueOnce(confirmInstall);
}

describe("runInitPrompts", () => {
  beforeEach(() => {
    vi.mocked(clack.intro).mockReset();
    vi.mocked(clack.select).mockReset();
    vi.mocked(clack.confirm).mockReset();
    vi.mocked(clack.multiselect).mockReset();
    vi.mocked(clack.note).mockReset();
    vi.mocked(clack.cancel).mockReset();
    vi.mocked(inquirer.checkbox).mockReset();
  });

  it("returns answers from interactive wizard", async () => {
    const dir = await createProjectDir("prompts-interactive");
    mockWizardFlow({ locale: "es", installCursor: true, linearEnabled: true });

    const result = await runInitPrompts(dir, {});
    expect(result.tools).toEqual(["cursor"]);
    expect(result.includeDocs).toBe(true);
    expect(result.locale).toBe("es");
    expect(result.linearEnabled).toBe(true);
    expect(clack.intro).toHaveBeenCalled();
  });

  it("throws InitCancelledError when user cancels at directory", async () => {
    const dir = await createProjectDir("prompts-cancel");
    vi.mocked(clack.select).mockResolvedValueOnce("en");
    vi.mocked(clack.confirm).mockResolvedValueOnce(false);

    await expect(runInitPrompts(dir, {})).rejects.toBeInstanceOf(
      InitCancelledError
    );
    expect(clack.cancel).toHaveBeenCalled();
  });

  it("throws when clack returns cancel symbol", async () => {
    const dir = await createProjectDir("prompts-clack-cancel");
    vi.mocked(clack.select).mockResolvedValueOnce(cancelSymbol);

    await expect(runInitPrompts(dir, {})).rejects.toBeInstanceOf(
      InitCancelledError
    );
  });

  it("runToolsAddPrompts returns cursor when not installed", async () => {
    const dir = await createProjectDir("prompts-add");
    vi.mocked(inquirer.checkbox).mockResolvedValueOnce(["cursor"]);
    const result = await runToolsAddPrompts(dir, []);
    expect(result).toEqual(["cursor"]);
  });

  it("runToolsRemovePrompts returns selected", async () => {
    vi.mocked(inquirer.checkbox).mockResolvedValueOnce(["cursor"]);
    const result = await runToolsRemovePrompts(["cursor", "codex"]);
    expect(result).toEqual(["cursor"]);
  });
});
