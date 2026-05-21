import { SpecflowCliError } from "../../errors.js";
import type { StateDatabase } from "./db.js";
import { withStateDb, withStateDbAsync } from "./db.js";
import { getActiveSession } from "./session.js";

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

export function getCurrentPhaseFromDb(
  targetDir: string
): string | undefined {
  return withStateDb(targetDir, (db) => {
    const session = getActiveSession(db);
    if (!session) return undefined;
    return getCurrentPhaseRow(db, session.id)?.phase;
  });
}

export async function setPhase(
  targetDir: string,
  phase: FlowPhase
): Promise<void> {
  await withStateDbAsync(targetDir, async (db) => {
    const session = getActiveSession(db);
    if (!session) {
      throw new SpecflowCliError(
        "NO_SESSION",
        "No active session. Run: specflow state start-session"
      );
    }
    setPhaseInDb(db, session.id, phase);
  });
}
