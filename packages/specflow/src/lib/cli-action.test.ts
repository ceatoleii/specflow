import { describe, it, expect, vi } from "vitest";
import { runCommandAction } from "./cli-action.js";
import { SpecflowCliError } from "../errors.js";
import { InitCancelledError } from "../commands/init.js";

describe("runCommandAction", () => {
  it("maps SpecflowCliError to exit code 1", async () => {
    const exit = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as typeof process.exit);

    runCommandAction(() => {
      throw new SpecflowCliError("NOT_INSTALLED", "missing");
    });

    await vi.waitFor(() => {
      expect(exit).toHaveBeenCalledWith(1);
    });

    exit.mockRestore();
  });

  it("calls onCancel for InitCancelledError", async () => {
    const exit = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as typeof process.exit);

    runCommandAction(
      () => {
        throw new InitCancelledError();
      },
      { onCancel: () => process.exit(0) }
    );

    await vi.waitFor(() => {
      expect(exit).toHaveBeenCalledWith(0);
    });

    exit.mockRestore();
  });
});
