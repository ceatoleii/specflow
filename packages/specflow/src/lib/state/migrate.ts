import fs from "fs-extra";
import path from "node:path";
import { withStateDbAsync, setMeta, getMeta, type StateDatabase } from "./db.js";
import { ensureActiveSession } from "./session.js";
import {
  isValidPhase,
  setPhaseInDb,
} from "./phase.js";
import { resolveStateCurrentPath } from "../paths.js";
import {
  DB_ARTIFACT_KINDS,
  LEGACY_ARTIFACT_FILES,
  legacyFileForKind,
} from "./artifacts.js";
import {
  parseAcceptanceCriteria,
  parseRefinementMessages,
  parseTasksMarkdown,
} from "./migrate-parsers.js";

export async function hasLegacyMarkdown(targetDir: string): Promise<boolean> {
  const currentDir = resolveStateCurrentPath(targetDir);
  if (!(await fs.pathExists(currentDir))) return false;
  for (const file of LEGACY_ARTIFACT_FILES) {
    if (await fs.pathExists(path.join(currentDir, file))) return true;
  }
  return false;
}

function upsertArtifact(
  db: StateDatabase,
  sessionId: string,
  kind: string,
  content: string
): void {
  const now = new Date().toISOString();
  const existing = db
    .prepare(
      "SELECT id FROM artifacts WHERE session_id = ? AND kind = ? LIMIT 1"
    )
    .get(sessionId, kind) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      "UPDATE artifacts SET content = ?, updated_at = ? WHERE id = ?"
    ).run(content, now, existing.id);
  } else {
    db.prepare(
      "INSERT INTO artifacts (session_id, kind, content, updated_at) VALUES (?, ?, ?, ?)"
    ).run(sessionId, kind, content, now);
  }
}

export async function migrateLegacyState(
  targetDir: string
): Promise<{ sessionId: string; migrated: boolean }> {
  const currentDir = resolveStateCurrentPath(targetDir);

  return withStateDbAsync(targetDir, async (db) => {
    if (getMeta(db, "migrated_from_legacy") === "1") {
      const session = ensureActiveSession(db);
      return { sessionId: session.id, migrated: false };
    }

    const session = ensureActiveSession(db, "Migrated session");
    const now = new Date().toISOString();

    const phasePath = path.join(currentDir, "phase.md");
    if (await fs.pathExists(phasePath)) {
      const phase = (await fs.readFile(phasePath, "utf8")).trim();
      if (isValidPhase(phase)) {
        setPhaseInDb(db, session.id, phase);
      }
    }

    const taskPath = path.join(currentDir, "task.md");
    if (await fs.pathExists(taskPath)) {
      const content = await fs.readFile(taskPath, "utf8");
      upsertArtifact(db, session.id, "task", content);
      const criteria = parseAcceptanceCriteria(content);
      db.prepare(
        "DELETE FROM acceptance_criteria WHERE session_id = ?"
      ).run(session.id);
      criteria.forEach((text, i) => {
        db.prepare(
          "INSERT INTO acceptance_criteria (session_id, text, checked, sort_order) VALUES (?, ?, 0, ?)"
        ).run(session.id, text, i);
      });
    }

    const refinementPath = path.join(currentDir, "refinement-log.md");
    if (await fs.pathExists(refinementPath)) {
      const content = await fs.readFile(refinementPath, "utf8");
      upsertArtifact(db, session.id, "refinement", content);
      const messages = parseRefinementMessages(content);
      db.prepare("DELETE FROM messages WHERE session_id = ?").run(session.id);
      for (const msg of messages) {
        db.prepare(
          "INSERT INTO messages (session_id, round, role, content, created_at) VALUES (?, ?, ?, ?, ?)"
        ).run(session.id, msg.round, msg.role, msg.content, now);
      }
    }

    for (const kind of DB_ARTIFACT_KINDS) {
      const filePath = path.join(currentDir, legacyFileForKind(kind));
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, "utf8");
        upsertArtifact(db, session.id, kind, content);
        if (kind === "tasks") {
          const parsed = parseTasksMarkdown(content);
          db.prepare("DELETE FROM tasks WHERE session_id = ?").run(session.id);
          for (const t of parsed) {
            db.prepare(
              `INSERT INTO tasks (session_id, code, title, body, status, sort_order)
               VALUES (?, ?, ?, ?, ?, ?)`
            ).run(session.id, t.code, t.title, t.body, t.status, t.sortOrder);
          }
        }
      }
    }

    setMeta(db, "migrated_from_legacy", "1");
    return { sessionId: session.id, migrated: true };
  });
}
