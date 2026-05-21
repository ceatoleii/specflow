import { describe, it, expect } from "vitest";
import { openDatabase } from "./db.js";
import { ensureActiveSession } from "./session.js";
import { upsertArtifact } from "./write-artifact.js";
import {
  syncCriteriaForSession,
  syncCriteriaFromTaskContent,
} from "./sync-criteria.js";
import { createProjectDir } from "../../test/helpers.js";
import { installTestProject } from "../../test/install-fixture.js";

describe("sync-criteria", () => {
  it("syncCriteriaFromTaskContent replaces acceptance criteria", async () => {
    const dir = await createProjectDir("sync-criteria-content");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const db = openDatabase(dir);
    const session = ensureActiveSession(db);

    const taskContent = `# Task: Demo

## Acceptance Criteria
- [ ] First criterion
- [ ] Second criterion
`;

    const count = syncCriteriaFromTaskContent(db, session.id, taskContent);
    expect(count).toBe(2);

    const rows = db
      .prepare(
        "SELECT text FROM acceptance_criteria WHERE session_id = ? ORDER BY sort_order"
      )
      .all(session.id) as Array<{ text: string }>;
    expect(rows.map((r) => r.text)).toEqual([
      "First criterion",
      "Second criterion",
    ]);
    db.close();
  });

  it("syncCriteriaForSession reads task artifact when content omitted", async () => {
    const dir = await createProjectDir("sync-criteria-artifact");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    upsertArtifact(
      db,
      session.id,
      "task",
      "# Task\n\n## Acceptance Criteria\n- [ ] From artifact\n"
    );
    db.close();

    const count = syncCriteriaForSession(dir);
    expect(count).toBe(1);
  });

  it("syncCriteriaForSession returns 0 when no task content", async () => {
    const dir = await createProjectDir("sync-criteria-empty");
    await installTestProject(dir, { includeDocs: false, tools: [] });

    expect(syncCriteriaForSession(dir)).toBe(0);
  });
});
