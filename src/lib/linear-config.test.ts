import { describe, it, expect } from "vitest";
import {
  normalizeLinearConfig,
  defaultLinearConfig,
  DEFAULT_LINEAR_STATES,
} from "./linear-config.js";

describe("normalizeLinearConfig", () => {
  it("returns null without enabled flag", () => {
    expect(normalizeLinearConfig({})).toBeNull();
  });

  it("applies default states", () => {
    const cfg = normalizeLinearConfig({ enabled: true });
    expect(cfg?.states).toEqual(DEFAULT_LINEAR_STATES);
  });

  it("merges partial states", () => {
    const cfg = normalizeLinearConfig({
      enabled: true,
      states: { onReviewPass: "Done" },
    });
    expect(cfg?.states.onReviewPass).toBe("Done");
    expect(cfg?.states.onApprove).toBe("In Progress");
  });
});

describe("defaultLinearConfig", () => {
  it("creates disabled config", () => {
    expect(defaultLinearConfig(false).enabled).toBe(false);
  });
});
