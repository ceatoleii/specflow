import type { StateDatabase } from "./db.js";

export interface SessionRow {
  id: string;
  title: string | null;
  created_at: string;
  archived_at: string | null;
  status: string;
}

export function newSessionId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 19).replace(/:/g, "");
  return `${date}_${time}`;
}

export function getActiveSession(db: StateDatabase): SessionRow | undefined {
  return db
    .prepare(
      "SELECT id, title, created_at, archived_at, status FROM sessions WHERE status = 'active' LIMIT 1"
    )
    .get() as SessionRow | undefined;
}

export function listSessions(
  db: StateDatabase,
  status?: "active" | "archived"
): SessionRow[] {
  if (status) {
    return db
      .prepare(
        "SELECT id, title, created_at, archived_at, status FROM sessions WHERE status = ? ORDER BY created_at DESC"
      )
      .all(status) as SessionRow[];
  }
  return db
    .prepare(
      "SELECT id, title, created_at, archived_at, status FROM sessions ORDER BY created_at DESC"
    )
    .all() as SessionRow[];
}

export function createNewSession(
  db: StateDatabase,
  title?: string
): SessionRow {
  const id = newSessionId();
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO sessions (id, title, created_at, status) VALUES (?, ?, ?, 'active')"
  ).run(id, title ?? null, createdAt);

  return {
    id,
    title: title ?? null,
    created_at: createdAt,
    archived_at: null,
    status: "active",
  };
}

/** @deprecated Use startFlowSession for new tasks; kept for in-session operations */
export function createActiveSession(
  db: StateDatabase,
  title?: string
): SessionRow {
  const existing = getActiveSession(db);
  if (existing) return existing;
  return createNewSession(db, title);
}

export function archiveActiveSession(db: StateDatabase): SessionRow | undefined {
  const session = getActiveSession(db);
  if (!session) return undefined;

  const archivedAt = new Date().toISOString();
  db.prepare(
    "UPDATE sessions SET status = 'archived', archived_at = ? WHERE id = ?"
  ).run(archivedAt, session.id);

  return { ...session, status: "archived", archived_at: archivedAt };
}

export function ensureActiveSession(
  db: StateDatabase,
  title?: string
): SessionRow {
  return getActiveSession(db) ?? createNewSession(db, title);
}
