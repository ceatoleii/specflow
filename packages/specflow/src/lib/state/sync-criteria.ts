import type { StateDatabase } from "./db.js";
import { withStateDb } from "./db.js";
import { ensureActiveSession } from "./session.js";
import { parseAcceptanceCriteria } from "./migrate-parsers.js";

export function syncCriteriaFromTaskContent(
  db: StateDatabase,
  sessionId: string,
  taskContent: string
): number {
  const criteria = parseAcceptanceCriteria(taskContent);
  db.prepare("DELETE FROM acceptance_criteria WHERE session_id = ?").run(
    sessionId
  );
  criteria.forEach((text, i) => {
    db.prepare(
      "INSERT INTO acceptance_criteria (session_id, text, checked, sort_order) VALUES (?, ?, 0, ?)"
    ).run(sessionId, text, i);
  });
  return criteria.length;
}

export function syncCriteriaForSession(
  targetDir: string,
  taskContent?: string
): number {
  return withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    let content = taskContent;
    if (content === undefined) {
      const row = db
        .prepare(
          "SELECT content FROM artifacts WHERE session_id = ? AND kind = 'task' LIMIT 1"
        )
        .get(session.id) as { content: string } | undefined;
      content = row?.content;
    }
    if (!content) return 0;
    return syncCriteriaFromTaskContent(db, session.id, content);
  });
}
