import type { StateDatabase } from "./db.js";
import { withStateDb } from "./db.js";
import { ensureActiveSession } from "./session.js";
import { parseTasksMarkdown } from "./migrate-parsers.js";
import { upsertArtifact } from "./write-artifact.js";

function statusMark(status: string): string {
  if (status === "done") return "x";
  if (status === "in_progress") return "~";
  return " ";
}

export function renderTasksMarkdown(db: StateDatabase, sessionId: string): string {
  const rows = db
    .prepare(
      `SELECT code, title, body, status FROM tasks
       WHERE session_id = ? ORDER BY sort_order ASC`
    )
    .all(sessionId) as Array<{
    code: string;
    title: string;
    body: string | null;
    status: string;
  }>;

  const lines = rows.map(
    (t) =>
      `- [${statusMark(t.status)}] **${t.code}** — ${t.title}: ${t.body ?? ""}`
  );

  return `# Tasks\n\n${lines.join("\n")}\n`;
}

export function syncTasksFromContent(targetDir: string, content: string): number {
  return withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    upsertArtifact(db, session.id, "tasks", content);
    const parsed = parseTasksMarkdown(content);
    db.prepare("DELETE FROM tasks WHERE session_id = ?").run(session.id);
    for (const t of parsed) {
      db.prepare(
        `INSERT INTO tasks (session_id, code, title, body, status, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(session.id, t.code, t.title, t.body, t.status, t.sortOrder);
    }
    return parsed.length;
  });
}

export function refreshTasksArtifact(targetDir: string): void {
  withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    const markdown = renderTasksMarkdown(db, session.id);
    upsertArtifact(db, session.id, "tasks", markdown);
  });
}
