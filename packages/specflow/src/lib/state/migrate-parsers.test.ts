import { describe, it, expect } from "vitest";
import {
  parseAcceptanceCriteria,
  parseRefinementMessages,
  parseTasksMarkdown,
} from "./migrate-parsers.js";

describe("migrate-parsers", () => {
  it("parseAcceptanceCriteria extracts checklist items", () => {
    const content = `# Task

## Acceptance Criteria
- [ ] First criterion
- [x] Done criterion

## Constraints
- noop
`;
    expect(parseAcceptanceCriteria(content)).toEqual([
      "First criterion",
      "Done criterion",
    ]);
  });

  it("parseRefinementMessages extracts user and agent messages", () => {
    const content = `## Round 1 — 2026-05-21
**User:** Need SOLID refactor
**Refiner:** What scope?
**Answers:** Only src
`;
    const messages = parseRefinementMessages(content);
    expect(messages).toHaveLength(3);
    expect(messages[0]).toMatchObject({ round: 1, role: "user" });
    expect(messages[1]).toMatchObject({ round: 1, role: "agent" });
    expect(messages[2].content).toContain("Only src");
  });

  it("parseTasksMarkdown extracts task codes and status", () => {
    const content = `- [ ] **T01** — Create module: first task
- [x] **T02** — Done task: completed
- [~] **T03** — WIP: in progress
`;
    const tasks = parseTasksMarkdown(content);
    expect(tasks).toHaveLength(3);
    expect(tasks[0]).toMatchObject({
      code: "T01",
      status: "pending",
      sortOrder: 0,
    });
    expect(tasks[1].status).toBe("done");
    expect(tasks[2].status).toBe("in_progress");
  });
});
