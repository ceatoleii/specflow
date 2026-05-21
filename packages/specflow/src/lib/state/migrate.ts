import fs from "fs-extra";
import path from "node:path";
import { openDatabase, setMeta, getMeta, type StateDatabase } from "./db.js";
import { ensureActiveSession } from "./session.js";
import {
  isValidPhase,
  setPhaseInDb,
  writePhaseShim,
} from "./phase.js";
import { resolveStateCurrentPath } from "../paths.js";

const LEGACY_FILES = [
  "phase.md",
  "task.md",
  "refinement-log.md",
  "sdd.md",
  "tasks.md",
  "review.md",
] as const;

export async function hasLegacyMarkdown(targetDir: string): Promise<boolean> {
  const currentDir = resolveStateCurrentPath(targetDir);
  if (!(await fs.pathExists(currentDir))) return false;
  for (const file of LEGACY_FILES) {
    if (await fs.pathExists(path.join(currentDir, file))) return true;
  }
  return false;
}

function parseAcceptanceCriteria(taskContent: string): string[] {
  const lines = taskContent.split("\n");
  const criteria: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (/^##\s+Acceptance Criteria/i.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^##\s+/.test(line)) break;
    if (inSection) {
      const m = line.match(/^-\s+\[[ xX~]\]\s+(.+)$/);
      if (m) criteria.push(m[1].trim());
    }
  }
  return criteria;
}

function parseRefinementMessages(content: string): Array<{
  round: number;
  role: string;
  content: string;
}> {
  const messages: Array<{ round: number; role: string; content: string }> = [];
  const blocks = content.split(/^## Round (\d+)/m).slice(1);

  for (let i = 0; i < blocks.length; i += 2) {
    const round = parseInt(blocks[i], 10);
    const body = blocks[i + 1] ?? "";
    const userMatch = body.match(/\*\*User:\*\*([\s\S]*?)(?=\*\*Refiner:\*\*|$)/);
    const refinerMatch = body.match(
      /\*\*Refiner:\*\*([\s\S]*?)(?=\*\*Answers:\*\*|$)/
    );
    const answersMatch = body.match(/\*\*Answers:\*\*([\s\S]*?)$/);

    if (userMatch) {
      messages.push({ round, role: "user", content: userMatch[1].trim() });
    }
    if (refinerMatch) {
      messages.push({ round, role: "agent", content: refinerMatch[1].trim() });
    }
    if (answersMatch?.[1]?.trim()) {
      messages.push({
        round,
        role: "user",
        content: answersMatch[1].trim(),
      });
    }
  }
  return messages;
}

function parseTasksMarkdown(content: string): Array<{
  code: string;
  title: string;
  body: string;
  status: string;
  sortOrder: number;
}> {
  const tasks: Array<{
    code: string;
    title: string;
    body: string;
    status: string;
    sortOrder: number;
  }> = [];
  const re =
    /^- \[( |x|~)\] \*\*(T\d+)\*\* — ([^:]+):\s*(.*)$/gim;
  let m: RegExpExecArray | null;
  let order = 0;

  while ((m = re.exec(content)) !== null) {
    const mark = m[1];
    const status =
      mark === "x" ? "done" : mark === "~" ? "in_progress" : "pending";
    tasks.push({
      code: m[2],
      title: m[3].trim(),
      body: m[4].trim(),
      status,
      sortOrder: order++,
    });
  }
  return tasks;
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
  const db = openDatabase(targetDir);

  try {
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

    for (const kind of ["sdd", "tasks", "review"] as const) {
      const fileName = kind === "tasks" ? "tasks.md" : `${kind}.md`;
      const filePath = path.join(currentDir, fileName);
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

    const phaseRow = db
      .prepare(
        `SELECT phase FROM phases WHERE session_id = ? AND ended_at IS NULL ORDER BY id DESC LIMIT 1`
      )
      .get(session.id) as { phase: string } | undefined;

    if (phaseRow?.phase && isValidPhase(phaseRow.phase)) {
      await writePhaseShim(targetDir, phaseRow.phase);
    }

    setMeta(db, "migrated_from_legacy", "1");
    return { sessionId: session.id, migrated: true };
  } finally {
    db.close();
  }
}
