import { describe, it, expect } from "vitest";
import {
  ARTIFACT_KIND_TO_FILE,
  LEGACY_ARTIFACT_FILES,
  artifactFileForKind,
  legacyFileForKind,
} from "./artifacts.js";

describe("artifacts", () => {
  it("maps DB artifact kinds to legacy filenames", () => {
    expect(legacyFileForKind("sdd")).toBe("sdd.md");
    expect(legacyFileForKind("tasks")).toBe("tasks.md");
    expect(legacyFileForKind("review")).toBe("review.md");
  });

  it("artifactFileForKind resolves known kinds", () => {
    expect(artifactFileForKind("task")).toBe("task.md");
    expect(artifactFileForKind("refinement")).toBe("refinement-log.md");
    expect(artifactFileForKind("unknown")).toBeUndefined();
  });

  it("LEGACY_ARTIFACT_FILES includes all exported artifact files", () => {
    const exported = new Set(Object.values(ARTIFACT_KIND_TO_FILE));
    exported.add("phase.md");
    for (const file of LEGACY_ARTIFACT_FILES) {
      expect(exported.has(file)).toBe(true);
    }
  });
});
