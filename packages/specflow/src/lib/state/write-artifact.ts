import fs from "fs-extra";
import type { StateDatabase } from "./db.js";
import { withStateDb } from "./db.js";
import { ensureActiveSession } from "./session.js";
import { SpecflowCliError } from "../../errors.js";

export const ARTIFACT_KINDS = [
  "task",
  "refinement",
  "sdd",
  "tasks",
  "review",
] as const;

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export function isValidArtifactKind(kind: string): kind is ArtifactKind {
  return (ARTIFACT_KINDS as readonly string[]).includes(kind);
}

export function upsertArtifact(
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

export async function readContentInput(
  filePath?: string,
  useStdin?: boolean
): Promise<string> {
  if (filePath) {
    if (!(await fs.pathExists(filePath))) {
      throw new SpecflowCliError("FILE_NOT_FOUND", `File not found: ${filePath}`);
    }
    return fs.readFile(filePath, "utf8");
  }
  if (useStdin) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw new SpecflowCliError(
    "MISSING_INPUT",
    "Provide --file <path> or --stdin for content."
  );
}

export function writeArtifact(
  targetDir: string,
  kind: ArtifactKind,
  content: string
): void {
  withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    upsertArtifact(db, session.id, kind, content);
  });
}

export function appendMessage(
  targetDir: string,
  round: number,
  role: "user" | "agent",
  content: string
): void {
  withStateDb(targetDir, (db) => {
    const session = ensureActiveSession(db);
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO messages (session_id, round, role, content, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(session.id, round, role, content, now);
  });
}
