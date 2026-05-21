import { describe, it, expect } from "vitest";
import { openDatabase } from "./db.js";
import { ensureActiveSession } from "./session.js";
import {
  syncTasksFromContent,
  refreshTasksArtifact,
  renderTasksMarkdown,
} from "./sync-tasks.js";
import { createProjectDir } from "../../test/helpers.js";
import { installTestProject } from "../../test/install-fixture.js";

describe("sync-tasks", () => {
  it("syncTasksFromContent parses tasks markdown", async () => {
    const dir = await createProjectDir("sync-tasks-content");
    await installTestProject(dir, { includeDocs: false, tools: [] });

    const content = `# Tasks

- [ ] **T01** — First task: Do one
- [~] **T02** — Second task: Do two
- [x] **T03** — Third task: Done
`;

    const count = syncTasksFromContent(dir, content);
    expect(count).toBe(3);

    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    const rows = db
      .prepare(
        "SELECT code, status FROM tasks WHERE session_id = ? ORDER BY sort_order"
      )
      .all(session.id) as Array<{ code: string; status: string }>;
    expect(rows).toEqual([
      { code: "T01", status: "pending" },
      { code: "T02", status: "in_progress" },
      { code: "T03", status: "done" },
    ]);
    db.close();
  });

  it("renderTasksMarkdown reflects task statuses", async () => {
    const dir = await createProjectDir("sync-tasks-render");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    db.prepare(
      `INSERT INTO tasks (session_id, code, title, body, status, sort_order)
       VALUES (?, 'T01', 'Alpha', 'Body', 'done', 0),
              (?, 'T02', 'Beta', 'Work', 'in_progress', 1),
              (?, 'T03', 'Gamma', '', 'pending', 2)`
    ).run(session.id, session.id, session.id);

    const markdown = renderTasksMarkdown(db, session.id);
    expect(markdown).toContain("- [x] **T01** — Alpha: Body");
    expect(markdown).toContain("- [~] **T02** — Beta: Work");
    expect(markdown).toContain("- [ ] **T03** — Gamma:");
    db.close();
  });

  it("refreshTasksArtifact updates tasks artifact", async () => {
    const dir = await createProjectDir("sync-tasks-refresh");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    syncTasksFromContent(
      dir,
      "# Tasks\n\n- [ ] **T01** — One: First\n"
    );

    refreshTasksArtifact(dir);

    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    const row = db
      .prepare(
        "SELECT content FROM artifacts WHERE session_id = ? AND kind = 'tasks'"
      )
      .get(session.id) as { content: string };
    expect(row.content).toContain("**T01** — One: First");
    db.close();
  });
});
