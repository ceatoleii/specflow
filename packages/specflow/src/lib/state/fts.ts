import { withStateDb } from "./db.js";
import { ensureActiveSession } from "./session.js";

export interface SearchHit {
  source: "decisions" | "messages";
  id: number;
  snippet: string;
}

export function searchState(targetDir: string, term: string): SearchHit[] {
  return withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    const hits: SearchHit[] = [];
    const escaped = term.replace(/"/g, '""');
    const query = `"${escaped}"`;

    const decisionRows = db
      .prepare(
        `SELECT d.id, d.content FROM decisions_fts fts
         JOIN decisions d ON d.id = fts.rowid
         WHERE decisions_fts MATCH ? AND d.session_id = ?`
      )
      .all(query, session.id) as Array<{ id: number; content: string }>;

    for (const row of decisionRows) {
      hits.push({
        source: "decisions",
        id: row.id,
        snippet: row.content.slice(0, 200),
      });
    }

    const messageRows = db
      .prepare(
        `SELECT m.id, m.content FROM messages_fts fts
         JOIN messages m ON m.id = fts.rowid
         WHERE messages_fts MATCH ? AND m.session_id = ?`
      )
      .all(query, session.id) as Array<{ id: number; content: string }>;

    for (const row of messageRows) {
      hits.push({
        source: "messages",
        id: row.id,
        snippet: row.content.slice(0, 200),
      });
    }

    return hits;
  });
}

export function insertDecision(
  targetDir: string,
  content: string,
  phase?: string
): void {
  withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO decisions (session_id, phase, content, created_at) VALUES (?, ?, ?, ?)"
    ).run(session.id, phase ?? null, content, now);
  });
}
