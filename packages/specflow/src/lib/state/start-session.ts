import { SpecflowCliError } from "../../errors.js";
import { withStateDb, withStateDbAsync } from "./db.js";
import {
  getActiveSession,
  createNewSession,
  archiveActiveSession,
  listSessions,
  type SessionRow,
} from "./session.js";
import { setPhaseInDb, type FlowPhase } from "./phase.js";

export function requireNoActiveSession(targetDir: string): void {
  withStateDb(targetDir, (db) => {
    const active = getActiveSession(db);
    if (active) {
      throw new SpecflowCliError(
        "ACTIVE_SESSION",
        `Active session ${active.id} in progress. Finish the flow or run: specflow state close-session`
      );
    }
  });
}

export async function startFlowSession(
  targetDir: string,
  title?: string
): Promise<{ sessionId: string; phase: FlowPhase }> {
  return withStateDbAsync(targetDir, async (db) => {
    const active = getActiveSession(db);
    if (active) {
      throw new SpecflowCliError(
        "ACTIVE_SESSION",
        `Active session ${active.id} in progress. Finish the flow or run: specflow state close-session`
      );
    }

    const session = createNewSession(db, title);
    setPhaseInDb(db, session.id, "refining");
    return { sessionId: session.id, phase: "refining" };
  });
}

export async function closeActiveSession(
  targetDir: string
): Promise<SessionRow | undefined> {
  return withStateDbAsync(targetDir, async (db) => {
    return archiveActiveSession(db) ?? undefined;
  });
}

export function listSessionsByStatus(
  targetDir: string,
  status?: "active" | "archived"
): SessionRow[] {
  return withStateDb(targetDir, (db) => listSessions(db, status));
}
