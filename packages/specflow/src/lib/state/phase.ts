import fs from "fs-extra";
import path from "node:path";
import type { StateDatabase } from "./db.js";
import { openDatabase } from "./db.js";
import { ensureActiveSession } from "./session.js";
import { resolveFlowPhasePath } from "../paths.js";

export const VALID_PHASES = [
  "refining",
  "designing",
  "implementing",
  "reviewing",
] as const;

export type FlowPhase = (typeof VALID_PHASES)[number];

export function isValidPhase(phase: string): phase is FlowPhase {
  return (VALID_PHASES as readonly string[]).includes(phase);
}

export function getCurrentPhaseRow(
  db: StateDatabase,
  sessionId: string
): { phase: string; started_at: string } | undefined {
  return db
    .prepare(
      `SELECT phase, started_at FROM phases
       WHERE session_id = ? AND ended_at IS NULL
       ORDER BY id DESC LIMIT 1`
    )
    .get(sessionId) as { phase: string; started_at: string } | undefined;
}

export function setPhaseInDb(
  db: StateDatabase,
  sessionId: string,
  phase: FlowPhase
): void {
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE phases SET ended_at = ? WHERE session_id = ? AND ended_at IS NULL"
  ).run(now, sessionId);
  db.prepare(
    "INSERT INTO phases (session_id, phase, started_at) VALUES (?, ?, ?)"
  ).run(sessionId, phase, now);
}

export async function writePhaseShim(
  targetDir: string,
  phase: string
): Promise<void> {
  const phasePath = resolveFlowPhasePath(targetDir);
  await fs.ensureDir(path.dirname(phasePath));
  await fs.writeFile(phasePath, `${phase}\n`, "utf8");
}

export async function readPhaseShim(targetDir: string): Promise<string | undefined> {
  const phasePath = resolveFlowPhasePath(targetDir);
  if (!(await fs.pathExists(phasePath))) return undefined;
  const raw = await fs.readFile(phasePath, "utf8");
  return raw.trim() || undefined;
}

export function getCurrentPhaseFromDb(
  targetDir: string
): string | undefined {
  const db = openDatabase(targetDir);
  try {
    const session = ensureActiveSession(db);
    const row = getCurrentPhaseRow(db, session.id);
    return row?.phase;
  } finally {
    db.close();
  }
}

export async function setPhase(
  targetDir: string,
  phase: FlowPhase
): Promise<void> {
  const db = openDatabase(targetDir);
  try {
    const session = ensureActiveSession(db);
    setPhaseInDb(db, session.id, phase);
    await writePhaseShim(targetDir, phase);
  } finally {
    db.close();
  }
}
