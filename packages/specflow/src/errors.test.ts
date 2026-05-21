import { describe, it, expect } from "vitest";
import { SpecflowCliError } from "./errors.js";

describe("SpecflowCliError", () => {
  it("stores code and message", () => {
    const err = new SpecflowCliError("NOT_INSTALLED", "not installed");
    expect(err.code).toBe("NOT_INSTALLED");
    expect(err.message).toBe("not installed");
    expect(err.name).toBe("SpecflowCliError");
  });
});
