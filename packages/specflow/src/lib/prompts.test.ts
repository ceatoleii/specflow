import { describe, it, expect, vi, beforeEach } from "vitest";
import * as inquirer from "@inquirer/prompts";
import {
  runInitPrompts,
  runToolsAddPrompts,
  runToolsRemovePrompts,
} from "./prompts.js";
import { createProjectDir } from "../test/helpers.js";

vi.mock("@inquirer/prompts", () => ({
  confirm: vi.fn(),
  checkbox: vi.fn(),
  select: vi.fn(),
}));

describe("runInitPrompts", () => {
  beforeEach(() => {
    vi.mocked(inquirer.confirm).mockReset();
    vi.mocked(inquirer.checkbox).mockReset();
    vi.mocked(inquirer.select).mockReset();
  });

  it("returns stable tools with yes shortcut", async () => {
    const dir = await createProjectDir("prompts-yes");
    const result = await runInitPrompts(dir, { yes: true });
    expect(result.tools).toContain("cursor");
    expect(result.tools).toContain("codex");
    expect(result.includeDocs).toBe(true);
    expect(inquirer.confirm).not.toHaveBeenCalled();
  });

  it("runs interactive flow", async () => {
    const dir = await createProjectDir("prompts-interactive");
    vi.mocked(inquirer.confirm)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    vi.mocked(inquirer.checkbox).mockResolvedValueOnce(["cursor", "windsurf"]);
    vi.mocked(inquirer.select).mockResolvedValueOnce("yes");

    const result = await runInitPrompts(dir, { yes: false });
    expect(result.tools).toEqual(["cursor", "windsurf"]);
    expect(result.includeDocs).toBe(true);
  });

  it("throws when user cancels at start", async () => {
    const dir = await createProjectDir("prompts-cancel");
    vi.mocked(inquirer.confirm).mockResolvedValueOnce(false);
    await expect(runInitPrompts(dir, { yes: false })).rejects.toThrow(
      "Instalación cancelada"
    );
  });

  it("runToolsAddPrompts returns selected tools", async () => {
    const dir = await createProjectDir("prompts-add");
    vi.mocked(inquirer.checkbox).mockResolvedValueOnce(["windsurf"]);
    const result = await runToolsAddPrompts(dir, ["cursor"]);
    expect(result).toEqual(["windsurf"]);
  });

  it("runToolsRemovePrompts returns selected", async () => {
    vi.mocked(inquirer.checkbox).mockResolvedValueOnce(["cursor"]);
    const result = await runToolsRemovePrompts(["cursor", "codex"]);
    expect(result).toEqual(["cursor"]);
  });
});
