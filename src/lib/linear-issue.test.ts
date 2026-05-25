import { describe, it, expect } from "vitest";
import { parseLinearIssueId, messageReferencesLinearIssue } from "./linear-issue.js";

describe("parseLinearIssueId", () => {
  it("parses bare identifier", () => {
    expect(parseLinearIssueId("nueva tarea desde PROJ-42")).toBe("PROJ-42");
  });

  it("parses linear.app URL", () => {
    expect(
      parseLinearIssueId(
        "https://linear.app/acme/issue/ENG-99/fix-login"
      )
    ).toBe("ENG-99");
  });

  it("returns null when no id", () => {
    expect(parseLinearIssueId("nueva tarea sin ticket")).toBeNull();
  });
});

describe("messageReferencesLinearIssue", () => {
  it("detects issue id in flow start", () => {
    expect(messageReferencesLinearIssue("flow on PROJ-1")).toBe(true);
  });

  it("returns false for generic flow", () => {
    expect(messageReferencesLinearIssue("nueva tarea")).toBe(false);
  });
});
