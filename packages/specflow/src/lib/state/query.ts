import type { StateDatabase } from "./db.js";
import { openDatabase } from "./db.js";
import { getActiveSession } from "./session.js";
import { getCurrentPhaseRow } from "./phase.js";

export type QuerySlice =
  | "phase"
  | "task"
  | "active-task"
  | "criteria"
  | "decisions"
  | "sdd-summary";

export function querySlice(
  targetDir: string,
  slice: QuerySlice
): string | null {
  const db = openDatabase(targetDir);
  try {
    const session = getActiveSession(db);
    if (!session) return null;

    switch (slice) {
      case "phase": {
        const row = getCurrentPhaseRow(db, session.id);
        return row?.phase ?? null;
      }
      case "task": {
        const row = db
          .prepare(
            "SELECT content FROM artifacts WHERE session_id = ? AND kind = 'task' LIMIT 1"
          )
          .get(session.id) as { content: string } | undefined;
        return row?.content ?? null;
      }
      case "active-task": {
        const row = db
          .prepare(
            `SELECT code, title, body, status FROM tasks
             WHERE session_id = ? AND status != 'done'
             ORDER BY sort_order ASC LIMIT 1`
          )
          .get(session.id) as
          | { code: string; title: string; body: string; status: string }
          | undefined;
        if (!row) return null;
        return `**${row.code}** — ${row.title}: ${row.body}\n(status: ${row.status})`;
      }
      case "criteria": {
        const rows = db
          .prepare(
            `SELECT text, checked FROM acceptance_criteria
             WHERE session_id = ? ORDER BY sort_order ASC`
          )
          .all(session.id) as Array<{ text: string; checked: number }>;
        if (!rows.length) return null;
        return rows
          .map((r) => `- [${r.checked ? "x" : " "}] ${r.text}`)
          .join("\n");
      }
      case "decisions": {
        const rows = db
          .prepare(
            `SELECT phase, content, created_at FROM decisions
             WHERE session_id = ? ORDER BY id ASC`
          )
          .all(session.id) as Array<{
          phase: string | null;
          content: string;
          created_at: string;
        }>;
        if (!rows.length) return null;
        return rows
          .map((r) => `[${r.phase ?? "?"}] ${r.content}`)
          .join("\n");
      }
      case "sdd-summary": {
        const row = db
          .prepare(
            "SELECT content FROM artifacts WHERE session_id = ? AND kind = 'sdd' LIMIT 1"
          )
          .get(session.id) as { content: string } | undefined;
        if (!row?.content) return null;
        const summary = row.content.match(
          /## Summary\s+([\s\S]*?)(?=\n---|\n## )/
        );
        return summary?.[1]?.trim() ?? row.content.slice(0, 2000);
      }
      default:
        return null;
    }
  } finally {
    db.close();
  }
}

export function syncTaskStatus(
  targetDir: string,
  code: string,
  status: "pending" | "in_progress" | "done"
): boolean {
  const db = openDatabase(targetDir);
  try {
    const session = getActiveSession(db);
    if (!session) return false;
    const result = db
      .prepare(
        "UPDATE tasks SET status = ? WHERE session_id = ? AND code = ?"
      )
      .run(status, session.id, code);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

export function getStateCounts(db: StateDatabase, sessionId: string) {
  const tasks = db
    .prepare("SELECT COUNT(*) as n FROM tasks WHERE session_id = ?")
    .get(sessionId) as { n: number };
  const criteria = db
    .prepare(
      "SELECT COUNT(*) as n FROM acceptance_criteria WHERE session_id = ?"
    )
    .get(sessionId) as { n: number };
  return { tasks: tasks.n, criteria: criteria.n };
}
